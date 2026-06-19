import { useState, useCallback, createContext, useEffect } from 'react';
import { generateId } from './utils/helpers.js';
import { decodeShareUrl, decodeTemplateUrl, decodeAllTemplatesUrl } from './utils/share.js';
import {
  getSettings,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  saveWorkout,
  getWorkouts,
  getActiveWorkout,
  saveActiveWorkout,
  clearActiveWorkout,
  getPreviousDataForExercise,
  getPreviousNotesForExercise,
} from './data/db.js';
import { supabase } from './data/supabase.js';
import { setSyncUser, uploadToCloud, downloadFromCloud } from './data/sync.js';
import BottomNav from './components/BottomNav.jsx';
import PullToRefresh from './components/PullToRefresh.jsx';
import SignInBanner from './components/SignInBanner.jsx';
import UpdatePrompt from './components/UpdatePrompt.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import ExercisesScreen from './screens/ExercisesScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import ActiveWorkout from './screens/ActiveWorkout.jsx';
import WorkoutSummary from './screens/WorkoutSummary.jsx';
import TemplateEditor from './screens/TemplateEditor.jsx';
import WorkoutDetail from './screens/WorkoutDetail.jsx';

export const AppContext = createContext(null);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(() => getActiveWorkout());
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingWorkout, setViewingWorkout] = useState(null);
  const [, forceUpdate] = useState(0);
  const [user, setUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setSyncUser(u?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setSyncUser(u?.id ?? null);

      if (u) {
        setSyncing(true);
        const hadCloudData = await downloadFromCloud();
        if (!hadCloudData) await uploadToCloud(u.id);
        setSyncing(false);
        forceUpdate(n => n + 1);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const sharedWorkout = decodeShareUrl(hash);
    if (sharedWorkout) {
      window.history.replaceState(null, '', window.location.pathname);
      const existing = getWorkouts();
      const alreadyImported = existing.some(
        w => w.templateName === sharedWorkout.templateName
          && w.completedAt === sharedWorkout.completedAt
          && w.shared
      );
      if (!alreadyImported) {
        saveWorkout(sharedWorkout);
      }
      setViewingWorkout(sharedWorkout);
      return;
    }

    const sharedTemplate = decodeTemplateUrl(hash);
    if (sharedTemplate) {
      window.history.replaceState(null, '', window.location.pathname);
      const existing = getTemplates();
      const alreadyImported = existing.some(
        t => t.name === sharedTemplate.name && t.shared
      );
      if (!alreadyImported) {
        saveTemplate(sharedTemplate);
      }
      setEditingTemplate(alreadyImported
        ? existing.find(t => t.name === sharedTemplate.name && t.shared)
        : sharedTemplate
      );
      forceUpdate(n => n + 1);
      return;
    }

    const sharedTemplates = decodeAllTemplatesUrl(hash);
    if (sharedTemplates && sharedTemplates.length > 0) {
      window.history.replaceState(null, '', window.location.pathname);
      const existing = getTemplates();
      let importedCount = 0;
      for (const tmpl of sharedTemplates) {
        const alreadyExists = existing.some(
          t => t.name === tmpl.name && t.shared
        );
        if (!alreadyExists) {
          saveTemplate(tmpl);
          importedCount++;
        }
      }
      setScreen('home');
      forceUpdate(n => n + 1);
    }
  }, []);

  const startWorkout = useCallback((template) => {
    const settings = getSettings();
    const workout = {
      id: generateId(),
      templateId: template.id,
      templateName: template.name,
      startedAt: new Date().toISOString(),
      supersets: template.supersets || [],
      exercises: template.exercises.map(te => {
        const prevData = getPreviousDataForExercise(te.exerciseId);
        const prevNotes = getPreviousNotesForExercise(te.exerciseId);
        return {
          exerciseId: te.exerciseId,
          exerciseName: '',
          weightUnit: te.weightUnit || settings.defaultWeightUnit,
          restTimerSeconds: te.restTimerSeconds,
          barType: te.barType,
          notes: prevNotes
            .filter(n => n.type === 'sticky' || n.showOnNextWorkout)
            .map(n => n.type === 'regular'
              ? { ...n, showOnNextWorkout: false, delivered: true }
              : { ...n, delivered: true }
            ),
          sets: (te.sets || Array.from({ length: te.defaultSets || 3 }, () => ({ setType: 'normal' }))).map((s, i) => ({
            setNumber: i + 1,
            setType: s.setType || 'normal',
            weight: '',
            reps: '',
            rpe: null,
            completed: false,
            weightUnit: te.weightUnit || settings.defaultWeightUnit,
          })),
        };
      }),
      originalOrder: template.exercises.map(e => e.exerciseId),
    };
    setActiveWorkout(workout);
    saveActiveWorkout(workout);
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;
    const now = new Date().toISOString();
    const currentOrder = activeWorkout.exercises.map(e => e.exerciseId);
    const orderChanged = JSON.stringify(currentOrder) !== JSON.stringify(activeWorkout.originalOrder);

    const completed = {
      ...activeWorkout,
      completedAt: now,
      orderChanged,
      exercises: activeWorkout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
        })),
      })),
    };

    delete completed.originalOrder;
    saveWorkout(completed);

    const templates = getTemplates();
    const template = templates.find(t => t.id === activeWorkout.templateId);
    if (template) {
      template.lastCompletedAt = now;
      saveTemplate(template);
    }

    clearActiveWorkout();
    setCompletedWorkout(completed);
    setActiveWorkout(null);
  }, [activeWorkout]);

  const cancelWorkout = useCallback(() => {
    clearActiveWorkout();
    setActiveWorkout(null);
  }, []);

  const ctx = {
    screen,
    setScreen,
    activeWorkout,
    setActiveWorkout,
    startWorkout,
    finishWorkout,
    cancelWorkout,
    editingTemplate,
    setEditingTemplate,
    viewingWorkout,
    setViewingWorkout,
    forceUpdate: () => forceUpdate(n => n + 1),
    user,
    syncing,
  };

  // 1. Completed workout summary (no nav)
  if (completedWorkout) {
    return (
      <AppContext.Provider value={ctx}>
        <PullToRefresh>
          <WorkoutSummary
            workout={completedWorkout}
            onDone={() => { setCompletedWorkout(null); setScreen('home'); }}
          />
          <UpdatePrompt />
        </PullToRefresh>
      </AppContext.Provider>
    );
  }

  // 2. Active workout (no nav)
  if (activeWorkout) {
    return (
      <AppContext.Provider value={ctx}>
        <PullToRefresh>
          <ActiveWorkout />
          <UpdatePrompt />
        </PullToRefresh>
      </AppContext.Provider>
    );
  }

  // 3. Template editor (no nav)
  if (editingTemplate) {
    return (
      <AppContext.Provider value={ctx}>
        <PullToRefresh>
          <TemplateEditor
            template={editingTemplate}
            onSave={(t) => {
              saveTemplate(t);
              setEditingTemplate(null);
              forceUpdate(n => n + 1);
            }}
            onDelete={(id) => {
              deleteTemplate(id);
              setEditingTemplate(null);
              forceUpdate(n => n + 1);
            }}
            onCancel={() => setEditingTemplate(null)}
          />
          <UpdatePrompt />
        </PullToRefresh>
      </AppContext.Provider>
    );
  }

  // 4. Workout detail (no nav)
  if (viewingWorkout) {
    return (
      <AppContext.Provider value={ctx}>
        <PullToRefresh>
          <WorkoutDetail
            workout={viewingWorkout}
            onBack={() => setViewingWorkout(null)}
          />
          <UpdatePrompt />
        </PullToRefresh>
      </AppContext.Provider>
    );
  }

  // 5. Normal screens + BottomNav
  return (
    <AppContext.Provider value={ctx}>
      <PullToRefresh>
        {!user && !bannerDismissed && (
          <SignInBanner onDismiss={() => setBannerDismissed(true)} />
        )}
        {screen === 'home' && <HomeScreen />}
        {screen === 'exercises' && <ExercisesScreen />}
        {screen === 'settings' && <SettingsScreen />}
        <BottomNav />
        <UpdatePrompt />
      </PullToRefresh>
    </AppContext.Provider>
  );
}
