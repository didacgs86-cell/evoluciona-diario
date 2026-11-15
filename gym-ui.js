/* Gym interface. State persistence is delegated to the main app. */
(function(root) {
  'use strict';
  root.EvoGymUI = {
    init({getState, commit, toast, onDaySaved, openDate}) {
      const G = root.EvoGym, E = root.Evo, $ = s => document.querySelector(s);
      const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const kg = n => Number(n).toLocaleString('es-ES', {maximumFractionDigits:3});
      const dateLabel = date => E.parseDate(date).toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'});
      const unitName = unit => ({total:'kg totales, incluida la barra', 'per-hand':'kg por mancuerna', machine:'kg indicados en la máquina'})[unit];
      const gym = () => getState().gym;
      let selectedDate = E.dateKey(), openExercise = null, editId = null, progressMonth = E.dateKey().slice(0,7);
      let selectedProgress = '', showArchived = false;
      const drafts = new Map();
      const key = (id, date = selectedDate) => id + '/' + date;
      const formFor = id => document.querySelector(`[data-gym-form="${id}"]`);
      const shortSets = s => s.sets.map(x => `${x.reps} × ${kg(x.kg)} kg`).join(' · ');
      const qualityLabel = q => ({good:'Buena técnica y sin dolor', unknown:'Sin valorar', technique:'Técnica a revisar', pain:'Dolor o molestias'})[q];

      function readDraft(form) {
        return {sets:[...form.querySelectorAll('.gym-set-row')].map(row => ({
          kg:row.querySelector('[data-set-kg]').value, reps:row.querySelector('[data-set-reps]').value
        })), rir:form.elements.rir.value, quality:form.elements.quality.value, note:form.elements.note.value, source:'draft'};
      }
      function keepDraft(form) {drafts.set(key(form.dataset.gymForm), readDraft(form));}
      function isDirty() {return drafts.size > 0;}
      function reset() {drafts.clear(); editId = null; openExercise = null;}
      function reference(session) {
        if (!session) return '<p class="empty">Todavía no hay entrenamientos anteriores de este ejercicio.</p>';
        return `<div class="gym-reference"><small>ÚLTIMO ENTRENAMIENTO · ${dateLabel(session.date)}</small><p>${escape(shortSets(session))}</p><small>${unitName(session.unit)} · ${session.rir === null ? 'RIR sin registrar' : 'RIR final ' + session.rir}</small></div>`;
      }
      function adviceHTML(advice, exercise) {
        return `<div class="gym-advice ${['pain','technique','large-step','too-large'].includes(advice.kind)?'caution':''}" data-advice="${advice.kind}"><strong>${escape(advice.title)}</strong>${advice.next !== undefined?`<b>${kg(advice.base)} → ${kg(advice.next)} kg <small>(+${kg(advice.percent)} %)</small></b>`:''}<p>${escape(advice.message)}</p><small>${unitName(exercise.unit)} · Orientación basada en tus registros; tú decides.</small></div>`;
      }
      function rowsHTML(exercise, values) {
        return values.map((set, i) => `<div class="gym-set-row"><span>${i+1}</span><label><span class="sr-only">Peso de la serie ${i+1} de ${escape(exercise.name)}</span><input data-set-kg type="number" min="0" max="2000" step="0.125" inputmode="decimal" value="${escape(set.kg)}" required aria-label="Peso serie ${i+1}: ${escape(exercise.name)}"></label><label><span class="sr-only">Repeticiones de la serie ${i+1}</span><input data-set-reps type="number" min="0" max="100" step="1" inputmode="numeric" value="${escape(set.reps)}" placeholder="Hechas" required aria-label="Repeticiones serie ${i+1}: ${escape(exercise.name)}"></label><button type="button" class="delete-button" data-remove-set="${i}" aria-label="Quitar serie ${i+1}">×</button></div>`).join('');
      }
      function exerciseHTML(exercise) {
        const current = gym().sessions.find(s => s.exerciseId === exercise.id && s.date === selectedDate);
        const previous = G.history(gym(), exercise.id, selectedDate, true).at(-1);
        const advice = G.recommendation(gym(), exercise, selectedDate);
        const draft = drafts.get(key(exercise.id));
        const values = draft || G.seed(gym(), exercise, selectedDate);
        return `<details class="gym-exercise" data-exercise-details="${exercise.id}" ${exercise.id === openExercise?'open':''}><summary><span><strong>${escape(exercise.name)}</strong><small>${exercise.targetSets} series · ${exercise.repMin}–${exercise.repMax} reps · ${exercise.unit==='per-hand'?'por mancuerna':exercise.unit==='total'?'peso total':'máquina'}</small></span><span class="badge">${draft?'Borrador':current?'Guardado':'Registrar'}</span></summary><div class="gym-exercise-body"><div class="row wrap"><span class="small muted">Registro: ${dateLabel(selectedDate)}</span><button class="text-button" data-edit-exercise="${exercise.id}">Editar ejercicio</button></div>${reference(previous)}${adviceHTML(advice, exercise)}<form data-gym-form="${exercise.id}" class="stack"><p class="small muted">${draft?'Borrador sin guardar.':current?'Estos son los datos guardados de este día. Puedes corregirlos.':values.source==='suggested'?'Peso sugerido precargado; registra las repeticiones que realmente hagas.':'Peso anterior como referencia; las repeticiones están vacías hasta que las registres.'} Solo registra series de trabajo, sin calentamientos.</p><div class="gym-set-head"><span>Serie</span><span>Peso (kg)</span><span>Reps hechas</span><span></span></div><div class="gym-sets">${rowsHTML(exercise, values.sets)}</div><div class="row wrap"><button type="button" class="text-button" data-add-set>+ Serie</button><small class="muted">${unitName(exercise.unit)}</small></div><div class="gym-load-actions">${previous&&!current?`<button type="button" class="secondary" data-last-loads>Usar últimos pesos</button>`:''}${advice.next !== undefined&&!current?`<button type="button" class="secondary" data-suggested-load="${advice.next}">${advice.kind==='large-step'?'Preparar prueba opcional':'Usar propuesta'}: ${kg(advice.next)} kg</button>`:''}</div><div class="two-fields"><label>Técnica y molestias<select name="quality"><option value="unknown" ${values.quality==='unknown'?'selected':''}>Sin valorar</option><option value="good" ${values.quality==='good'?'selected':''}>Buena técnica, sin dolor</option><option value="technique" ${values.quality==='technique'?'selected':''}>Técnica a revisar</option><option value="pain" ${values.quality==='pain'?'selected':''}>Dolor o molestias</option></select></label><label>RIR de la última serie<select name="rir"><option value="">Sin registrar</option>${Array.from({length:11},(_,n)=>`<option value="${n}" ${values.rir!==null&&values.rir!==''&&Number(values.rir)===n?'selected':''}>${n===10?'10 o más':n} ${n===0?'· ninguna más':''}</option>`).join('')}</select></label></div><p class="small muted">RIR = repeticiones extra que crees que habrías podido hacer con buena técnica. «2» significa que te quedaban unas dos. No hace falta llegar al fallo.</p><label>Nota opcional<input name="note" maxlength="500" value="${escape(values.note)}" placeholder="Descanso, sensaciones, ajustes…"></label><button class="primary" type="submit">${current?'Actualizar registro':'Guardar entrenamiento'}</button><div class="row wrap">${draft?'<button type="button" class="text-button" data-discard-draft>Descartar borrador</button>':''}${current?'<button type="button" class="text-button" data-delete-session>Eliminar registro del día</button>':''}</div></form></div></details>`;
      }
      function render(date = selectedDate) {
        selectedDate = date;
        const exercises = gym().exercises.filter(e => showArchived || !e.archived);
        const count=gym().exercises.filter(e=>!e.archived).length;
        $('#gym-exercise-count').textContent = `${count} ${count===1?'ejercicio':'ejercicios'}`;
        $('#gym-content').innerHTML = `<div class="section-head gym-top"><p class="muted small">Tu siguiente paso, con el último entrenamiento a la vista.</p><button class="primary" data-new-exercise>+ Ejercicio</button></div><p class="small muted">Fecha: ${dateLabel(date)}. Los registros de gimnasio y los borradores no están cifrados.</p>${exercises.length?exercises.map(exerciseHTML).join(''):'<p class="empty">Añade tu primer ejercicio: por ejemplo, press banca inclinado o curl de bíceps. Define series, rango de repeticiones y el salto de peso disponible.</p>'}<button class="text-button" data-show-archived>${showArchived?'Ocultar archivados':'Gestionar ejercicios archivados'}</button>${showArchived?'<p class="small muted">Puedes reactivar un ejercicio desde «Editar ejercicio». Su historial se conserva.</p>':''}<details class="gym-method"><summary>Cómo se propone la subida</summary><p class="small muted">La doble progresión sube primero repeticiones y después carga. La regla de esta app pide todas las series previstas al techo del rango, con el mismo peso, buena técnica, sin dolor y al menos 2 RIR en la última serie. Por defecto pide dos sesiones consecutivas; puedes elegir una. Son decisiones prudentes de diseño, no umbrales universales demostrados.</p><p class="small muted">Solo se precarga una subida si el salto disponible es como máximo del 10 %. Si es mayor, se avisa y se conserva el peso anterior; por encima del 20 % no se prepara ninguna subida. No se garantiza que con el nuevo peso puedas hacer exactamente 8 repeticiones ni que más peso implique más músculo. Rango 8–12 y 3 series son valores editables, no una pauta obligatoria. La progresión automática no está pensada para máquinas asistidas.</p><p class="small muted">Base: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/" target="_blank" rel="noopener noreferrer">posición ACSM 2026</a> (sobrecarga progresiva, esfuerzo y adaptación individual) y <a href="https://pubmed.ncbi.nlm.nih.gov/19204579/" target="_blank" rel="noopener noreferrer">ACSM 2009</a> (referencia histórica de incrementos del 2–10 %). No se atribuye a esas guías la validación de este algoritmo concreto.</p></details>`;
        $('#gym-content').querySelectorAll('[data-exercise-details]').forEach(details => details.addEventListener('toggle', () => {if(details.open) openExercise = details.dataset.exerciseDetails;}));
      }
      function openEditor(id = null) {
        if (gym().exercises.length >= 200 && !id) {toast('Has alcanzado el límite de 200 ejercicios.');return;}
        editId = id;
        const exercise = gym().exercises.find(e => e.id === id);
        const f = $('#gym-exercise-form');f.reset();
        const defaults = exercise || {name:'', unit:'total', initialWeight:0, targetSets:3, repMin:8, repMax:12, increment:1, confirmations:2};
        for (const name of ['name','unit','initialWeight','targetSets','repMin','repMax','increment','confirmations']) f.elements[name].value = defaults[name];
        // Never change the meaning of stored kg values after a first record.
        f.elements.unit.disabled = !!exercise && gym().sessions.some(s => s.exerciseId === id);
        $('#gym-editor-title').textContent = exercise?'Editar ejercicio':'Nuevo ejercicio';
        $('#gym-archive-exercise').hidden = !exercise;
        $('#gym-archive-exercise').textContent = exercise?.archived?'Reactivar ejercicio':'Archivar ejercicio';
        $('#gym-exercise-dialog').showModal();
      }
      $('#gym-exercise-form').onsubmit = event => {
        event.preventDefault();const f = event.target;
        const old = gym().exercises.find(e=>e.id===editId);
        const exercise = {id:old?.id || E.uid(), name:f.elements.name.value.trim(), unit:f.elements.unit.value,
          initialWeight:Number(f.elements.initialWeight.value), targetSets:Number(f.elements.targetSets.value),
          repMin:Number(f.elements.repMin.value), repMax:Number(f.elements.repMax.value), increment:Number(f.elements.increment.value),
          confirmations:Number(f.elements.confirmations.value), archived:old?.archived || false, created:old?.created || E.dateKey()};
        if (!exercise.name || exercise.repMax <= exercise.repMin) {toast('El nombre es obligatorio y el máximo de repeticiones debe superar al mínimo.');return;}
        try {G.validate({exercises:[exercise],sessions:[]}, E.validDate);} catch(error) {toast(error.message);return;}
        if (drafts.has(key(exercise.id)) && !confirm('Editar la pauta descartará el borrador de este ejercicio en esta fecha. ¿Continuar?')) return;
        if(commit(() => {if(old) Object.assign(old,exercise);else gym().exercises.push(exercise);}, old?'Ejercicio actualizado':'Ejercicio añadido')) {
          drafts.delete(key(exercise.id));openExercise=exercise.id;$('#gym-exercise-dialog').close();$('#gym-panel').open=true;render();renderProgress(progressMonth);
        }
      };
      $('#gym-archive-exercise').onclick = () => {
        const exercise = gym().exercises.find(e=>e.id===editId);if(!exercise)return;
        if(commit(()=>exercise.archived=!exercise.archived, exercise.archived?'Ejercicio reactivado':'Ejercicio archivado; se conserva el historial')) {
          $('#gym-exercise-dialog').close();render();renderProgress(progressMonth);
        }
      };
      $('#gym-content').addEventListener('input', event => {const form=event.target.closest('[data-gym-form]');if(form)keepDraft(form);});
      $('#gym-content').addEventListener('change', event => {const form=event.target.closest('[data-gym-form]');if(form)keepDraft(form);});
      $('#gym-content').addEventListener('submit', event => {
        const f=event.target.closest('[data-gym-form]');if(!f)return;event.preventDefault();
        const exercise=gym().exercises.find(e=>e.id===f.dataset.gymForm), draft=readDraft(f);
        if(!f.reportValidity())return;
        const current=gym().sessions.find(s=>s.exerciseId===exercise.id&&s.date===selectedDate);
        const session={id:current?.id || E.uid(),exerciseId:exercise.id,date:selectedDate,unit:exercise.unit,
          targetSets:exercise.targetSets,repMin:exercise.repMin,repMax:exercise.repMax,
          sets:draft.sets.map(s=>({kg:Number(s.kg),reps:Number(s.reps)})),rir:draft.rir===''?null:Number(draft.rir),
          quality:draft.quality,note:draft.note.trim()};
        if(!current&&gym().sessions.length>=10000){toast('Has alcanzado el límite de registros de gimnasio. Exporta una copia antes de gestionar el historial.');return;}
        try {G.validate({exercises:[exercise],sessions:[session]},E.validDate);}catch(error){toast(error.message);return;}
        if(commit(()=>{
          if(current)Object.assign(current,session);else gym().sessions.push(session);
          const s=getState();if(s.habits.some(h=>h.id==='gym')) {
            s.days[selectedDate] ||= {habits:{},mood:null,achievement:'',starred:false};s.days[selectedDate].habits.gym='done';
          }
        },'Entrenamiento guardado')) {
          drafts.delete(key(exercise.id));openExercise=exercise.id;onDaySaved();render();renderProgress(progressMonth);
        }
      });
      $('#gym-content').addEventListener('click', event => {
        const button=event.target.closest('button');if(!button)return;
        if(button.hasAttribute('data-new-exercise'))return openEditor();
        if(button.hasAttribute('data-show-archived')){showArchived=!showArchived;render();return;}
        if(button.dataset.editExercise)return openEditor(button.dataset.editExercise);
        const f=button.closest('[data-gym-form]');if(!f)return;
        const exercise=gym().exercises.find(e=>e.id===f.dataset.gymForm);
        const id=exercise.id;
        if(button.hasAttribute('data-add-set')){const values=readDraft(f);if(values.sets.length>=20){toast('Máximo 20 series por registro.');return;}values.sets.push({kg:values.sets.at(-1)?.kg??exercise.initialWeight,reps:''});drafts.set(key(id),values);openExercise=id;render();}
        if(button.dataset.removeSet!==undefined){const values=readDraft(f);if(values.sets.length<=1){toast('Debe quedar al menos una serie.');return;}values.sets.splice(Number(button.dataset.removeSet),1);drafts.set(key(id),values);openExercise=id;render();}
        if(button.hasAttribute('data-last-loads')||button.dataset.suggestedLoad!==undefined){const values=readDraft(f),previous=G.history(gym(),id,selectedDate,true).at(-1);values.sets=values.sets.map((s,i)=>({...s,kg:button.dataset.suggestedLoad!==undefined?Number(button.dataset.suggestedLoad):previous?.sets[i]?.kg??previous?.sets[0]?.kg??exercise.initialWeight}));drafts.set(key(id),values);openExercise=id;render();toast('Pesos preparados. Solo se registran cuando guardes las repeticiones reales.');}
        if(button.hasAttribute('data-discard-draft')&&confirm('¿Descartar el borrador de este ejercicio?')){drafts.delete(key(id));render();}
        if(button.hasAttribute('data-delete-session')&&confirm('¿Eliminar el registro de este ejercicio en esta fecha? El hábito «He ido al gimnasio» se conserva.')) {
          if(commit(()=>getState().gym.sessions=gym().sessions.filter(s=>!(s.exerciseId===id&&s.date===selectedDate)),'Registro eliminado')){drafts.delete(key(id));onDaySaved();render();renderProgress(progressMonth);}
        }
      });
      function renderProgress(month) {
        progressMonth=month;
        const list=gym().exercises;
        if(!list.some(e=>e.id===selectedProgress))selectedProgress=list[0]?.id||'';
        $('#gym-progress-content').innerHTML=list.length?`<label>Ejercicio<select id="gym-progress-exercise">${list.map(e=>`<option value="${e.id}" ${selectedProgress===e.id?'selected':''}>${escape(e.name)}${e.archived?' (archivado)':''}</option>`).join('')}</select></label><div id="gym-progress-detail"></div>`:'<p class="empty">Añade ejercicios desde Hoy → Gimnasio para ver aquí tu evolución.</p>';
        if(!list.length)return;
        $('#gym-progress-exercise').onchange=event=>{selectedProgress=event.target.value;renderProgress(month);};
        const exercise=list.find(e=>e.id===selectedProgress);
        const history=G.history(gym(),exercise.id,month+'-31');
        const sessions=history.slice(-20);
        const host=$('#gym-progress-detail');
        if(!sessions.length){host.innerHTML='<p class="empty">Sin registros de este ejercicio hasta el mes seleccionado.</p>';return;}
        const max=Math.max(1,...sessions.map(s=>s.sets[0].kg));
        const x=i=>sessions.length===1?250:45+i/(sessions.length-1)*410, y=weight=>150-weight/max*120;
        host.innerHTML=`<p class="small muted">Últimas ${sessions.length} de ${history.length} sesiones hasta ${month}. Carga de la primera serie; ${unitName(exercise.unit)}. La gráfica representa carga externa, no masa muscular.</p><svg class="chart" viewBox="0 0 480 185" role="img" aria-label="Carga de la primera serie. Datos completos en la tabla inferior."><line x1="45" y1="150" x2="455" y2="150" stroke="#dce3da"/><text x="3" y="150">0 kg</text><text x="3" y="30">${kg(max)}</text>${sessions.slice(1).map((s,i)=>s.unit===sessions[i].unit?`<line x1="${x(i)}" y1="${y(sessions[i].sets[0].kg)}" x2="${x(i+1)}" y2="${y(s.sets[0].kg)}" stroke="#176b55" stroke-width="2"/>`:'').join('')}${sessions.map((s,i)=>`<circle cx="${x(i)}" cy="${y(s.sets[0].kg)}" r="4" fill="#176b55"><title>${s.date}: ${kg(s.sets[0].kg)} kg</title></circle>`).join('')}<text x="45" y="178">${sessions[0].date.slice(5)}</text><text x="410" y="178">${sessions.at(-1).date.slice(5)}</text></svg><div class="gym-history">${sessions.slice().reverse().map(s=>`<div class="gym-history-row"><button class="text-button" data-gym-history-date="${s.date}">${dateLabel(s.date)}</button><div><p>${escape(shortSets(s))}</p><small>${s.sets.length} series · ${s.sets.reduce((n,x)=>n+x.reps,0)} reps totales · ${s.rir===null?'RIR sin registrar':'RIR final '+s.rir} · ${qualityLabel(s.quality)}</small>${s.note?`<p class="small muted">${escape(s.note)}</p>`:''}</div></div>`).join('')}</div>`;
        host.querySelectorAll('[data-gym-history-date]').forEach(b=>b.onclick=()=>{openExercise=exercise.id;openDate(b.dataset.gymHistoryDate);$('#gym-panel').open=true;render(b.dataset.gymHistoryDate);});
      }
      return {render, renderProgress, isDirty, reset, open:()=>{ $('#gym-panel').open=true;$('#gym-panel').scrollIntoView({behavior:'smooth',block:'start'}); }};
    }
  };
})(globalThis);
