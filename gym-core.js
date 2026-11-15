/* Gym data and double-progression rules. Suggestions are editable heuristics,
   not a prediction of how many repetitions a person will achieve. */
(function(root) {
  'use strict';
  const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x) &&
    (Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null);
  const safeId = x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(x) &&
    !['__proto__', 'constructor', 'prototype'].includes(x);
  const number = (x, min, max) => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
  const integer = (x, min, max) => number(x, min, max) && Number.isInteger(x);
  const text = (x, max) => typeof x === 'string' && x.length <= max;
  const units = ['total', 'per-hand', 'machine'];
  const qualities = ['unknown', 'good', 'technique', 'pain'];
  const empty = () => ({exercises: [], sessions: []});
  const assert = value => {if (!value) throw new Error('Los datos de gimnasio de la copia no son válidos.');};
  const round = value => Math.round((value + Number.EPSILON) * 1000) / 1000;

  function validate(gym, validDate) {
    assert(plain(gym) && Array.isArray(gym.exercises) && gym.exercises.length <= 200 &&
      Array.isArray(gym.sessions) && gym.sessions.length <= 10000);
    const exerciseIds = new Set(), exerciseById = new Map();
    for (const e of gym.exercises) {
      assert(plain(e) && safeId(e.id) && !exerciseIds.has(e.id) && text(e.name, 100) && e.name.trim() &&
        units.includes(e.unit) && number(e.initialWeight, 0, 2000) && integer(e.targetSets, 1, 10) &&
        integer(e.repMin, 1, 50) && integer(e.repMax, e.repMin + 1, 50) &&
        number(e.increment, 0.125, 100) && [1, 2].includes(e.confirmations) &&
        typeof e.archived === 'boolean' && validDate(e.created));
      exerciseIds.add(e.id); exerciseById.set(e.id,e);
    }
    const sessionIds = new Set(), dates = new Set();
    for (const s of gym.sessions) {
      assert(plain(s) && safeId(s.id) && !sessionIds.has(s.id) && exerciseIds.has(s.exerciseId) &&
        validDate(s.date) && !dates.has(s.exerciseId + '/' + s.date) && units.includes(s.unit) && s.unit === exerciseById.get(s.exerciseId).unit &&
        integer(s.targetSets, 1, 10) && integer(s.repMin, 1, 50) && integer(s.repMax, s.repMin + 1, 50) &&
        Array.isArray(s.sets) && s.sets.length >= 1 && s.sets.length <= 20 &&
        (s.rir === null || integer(s.rir, 0, 10)) && qualities.includes(s.quality) && text(s.note, 500));
      for (const set of s.sets) assert(plain(set) && number(set.kg, 0, 2000) && integer(set.reps, 0, 100));
      sessionIds.add(s.id); dates.add(s.exerciseId + '/' + s.date);
    }
    return gym;
  }

  function history(gym, exerciseId, date = '2100-12-31', strict = false) {
    return gym.sessions.filter(s => s.exerciseId === exerciseId && (strict ? s.date < date : s.date <= date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  function sameLoad(session) {
    return !!session?.sets.length && session.sets.every(s => Math.abs(s.kg - session.sets[0].kg) < 0.0001);
  }
  function planMatches(exercise, session) {
    return session.targetSets === exercise.targetSets && session.repMin === exercise.repMin &&
      session.repMax === exercise.repMax && session.unit === exercise.unit;
  }
  function qualifies(exercise, session, load) {
    return !!session && planMatches(exercise, session) && session.sets.length === exercise.targetSets &&
      sameLoad(session) && Math.abs(session.sets[0].kg - load) < 0.0001 &&
      session.sets.every(s => s.reps >= exercise.repMax) && session.quality === 'good' &&
      session.rir !== null && session.rir >= 2;
  }
  function recommendation(gym, exercise, date = '2100-12-31') {
    const sessions = history(gym, exercise.id, date), last = sessions.at(-1);
    const result = (kind, title, message, extra = {}) => ({kind, title, message, base: last?.sets[0]?.kg ?? exercise.initialWeight, ...extra});
    if (!last) return result('start', 'Tu primera referencia',
      `Registra las series que hagas. El rango ${exercise.repMin}–${exercise.repMax} es una referencia flexible; no hace falta llegar al fallo.`);
    if (last.quality === 'pain') return result('pain', 'Sin propuesta de subida',
      'Has registrado dolor o molestias. No aumentes la carga por este resultado; adapta o detén el ejercicio y valora la causa si persiste.');
    if (last.quality === 'technique') return result('technique', 'Primero, recuperar la técnica',
      'No se propone subir. Mantén o reduce la carga para recuperar un movimiento controlado y sin dolor.');
    if (!planMatches(exercise, last)) return result('changed-plan', 'La pauta ha cambiado',
      'El último registro pertenece a otra pauta. Registra una sesión con la pauta actual antes de valorar una subida.');
    if (last.sets.length !== exercise.targetSets) return result('incomplete', 'Compara el mismo número de series',
      `Has registrado ${last.sets.length} de ${exercise.targetSets} series de trabajo previstas. No se propone subir por un registro parcial o con series extra.`);
    if (last.unit !== exercise.unit || !sameLoad(last)) return result('mixed', 'Cargas diferentes entre series',
      'Se conservan todos los pesos, pero no se calcula una subida automática. La doble progresión compara series con la misma carga.');
    const load = last.sets[0].kg;
    if (last.sets.some(s => s.reps < exercise.repMin)) return result('below', 'Afianza la carga antes de subir',
      `Alguna serie quedó por debajo de ${exercise.repMin} repeticiones. Puedes repetir o ajustar la carga y el descanso; no necesitas forzar el rango.`);
    if (last.sets.some(s => s.reps < exercise.repMax)) return result('build', 'Primero, sumar repeticiones',
      `Mantén la carga como referencia y busca alguna repetición más con buena técnica, hasta acercarte a ${exercise.repMax} en todas las series. No tienen que subir todas a la vez.`);
    if (last.quality !== 'good' || last.rir === null) return result('check', 'Has llegado al techo de repeticiones',
      'Para valorar una subida, confirma buena técnica, ausencia de dolor y cuántas repeticiones te quedaban en la última serie. Sin esos datos no se propone subir.');
    if (last.rir < 2) return result('effort', 'Consolida el resultado',
      'Has llegado al techo, pero con menos de 2 repeticiones en reserva en la última serie. Repite antes de subir. Este margen es una regla prudente de la app, no un requisito universal para ganar músculo.');
    if (load <= 0) return result('zero', 'Decide primero una carga externa',
      'No se calcula un porcentaje de subida desde 0 kg. Puedes introducir manualmente una carga y registrar cómo la toleras.');
    let streak = 0;
    for (let i = sessions.length - 1; i >= 0 && qualifies(exercise, sessions[i], load); i--) streak++;
    if (streak < exercise.confirmations) return result('confirm', 'Techo alcanzado: confírmalo',
      `Buen registro. Llevas ${streak}/${exercise.confirmations} sesiones consecutivas con todas las series en el techo, buena técnica y al menos 2 repeticiones en reserva. Repite para confirmar.`, {streak});
    const next = round(load + exercise.increment), percent = round(exercise.increment / load * 100);
    if (next > 2000) return result('limit', 'Ajusta la carga manualmente', 'La propuesta supera el límite de registro de la aplicación.');
    if (percent > 20) return result('too-large', 'Busca un incremento menor',
      `El salto configurado sería del ${percent.toLocaleString('es-ES')} %. No se prepara esa subida. Cambia el incremento disponible o progresa con la carga actual.`, {percent, streak});
    if (percent > 10) return result('large-step', 'El siguiente salto es grande',
      `El incremento disponible supone un ${percent.toLocaleString('es-ES')} %. Si puedes, usa una microcarga menor. Si solo tienes ese salto, la carga superior es una prueba opcional: no se garantiza que puedas completar el mínimo de repeticiones.`,
      {next, percent, streak});
    return result('increase', 'Puedes probar una pequeña subida',
      `Pauta confirmada. Prueba la siguiente carga y vuelve a la parte baja del rango ${exercise.repMin}–${exercise.repMax}, manteniendo la técnica y unas 2–3 repeticiones en reserva. Si no encaja, vuelve a ajustar.`,
      {next, percent, streak});
  }
  function seed(gym, exercise, date) {
    const current = gym.sessions.find(s => s.exerciseId === exercise.id && s.date === date);
    if (current) return {sets: current.sets.map(s => ({...s})), rir: current.rir, quality: current.quality,
      note: current.note, source: 'saved'};
    const previous = history(gym, exercise.id, date, true).at(-1);
    const advice = recommendation(gym, exercise, date);
    // Suggested loads are never a completed set: repetitions always start empty.
    const sets = Array.from({length: exercise.targetSets}, (_, i) => ({
      kg: advice.kind === 'increase' ? advice.next : previous?.sets[i]?.kg ?? previous?.sets[0]?.kg ?? exercise.initialWeight,
      reps: ''
    }));
    return {sets, rir: null, quality: 'unknown', note: '', source: advice.kind === 'increase' ? 'suggested' : 'reference'};
  }
  const api = {empty, validate, history, sameLoad, qualifies, recommendation, seed, round};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EvoGym = api;
})(globalThis);
