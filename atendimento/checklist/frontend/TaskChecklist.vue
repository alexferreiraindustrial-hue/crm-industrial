<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useAlert } from 'dashboard/composables';
import ChecklistListsAPI from 'dashboard/api/checklistLists';
import ChecklistBoardAPI from 'dashboard/api/checklistBoard';

const loading = ref(true);
const board = ref({
  day: '',
  list_id: null,
  pending: [],
  fixed: [],
  adhoc: [],
  done: [],
  routines: [],
});
const stats = ref(null);
const selectedDay = ref(new Date().toISOString().slice(0, 10));
const filterMode = ref('day');
const newItemTitle = ref('');
const newRoutineTitle = ref('');

const pendingItems = computed(() => board.value.pending || []);
const fixedItems = computed(() => board.value.fixed || []);
const adhocItems = computed(() => board.value.adhoc || []);
const doneItems = computed(() => board.value.done || []);
const openCount = computed(
  () => pendingItems.value.length + fixedItems.value.length + adhocItems.value.length
);
const dayRate = computed(() => stats.value?.rates?.day?.rate || 0);
const weekRate = computed(() => stats.value?.rates?.week?.rate || 0);
const monthRate = computed(() => stats.value?.rates?.month?.rate || 0);
const trendKey = computed(() => {
  if (filterMode.value === 'month') return 'days_90';
  return 'days_7';
});
const trendRows = computed(() => stats.value?.trends?.[trendKey.value] || []);
const heatmap = computed(() => stats.value?.heatmap || []);

function heatClass(count) {
  if (!count) return 'bg-n-alpha-1';
  if (count === 1) return 'bg-[#9ecae1]';
  if (count === 2) return 'bg-[#6baed6]';
  if (count <= 4) return 'bg-[#3182bd]';
  return 'bg-[#08519c]';
}

async function loadBoard() {
  loading.value = true;
  try {
    const [{ data: boardData }, { data: statsData }] = await Promise.all([
      ChecklistBoardAPI.getBoard(selectedDay.value),
      ChecklistBoardAPI.getStats({ on: selectedDay.value, range: filterMode.value }),
    ]);
    board.value = boardData;
    stats.value = statsData;
  } catch {
    useAlert('Não foi possível carregar o checklist do dia.');
  } finally {
    loading.value = false;
  }
}

async function createItem() {
  const title = newItemTitle.value.trim();
  if (!title || !board.value.list_id) return;
  try {
    await ChecklistListsAPI.createItem(board.value.list_id, title, {
      due_on: selectedDay.value,
      kind: 'adhoc',
    });
    newItemTitle.value = '';
    await loadBoard();
  } catch {
    useAlert('Não foi possível adicionar a tarefa.');
  }
}

async function toggleItem(item) {
  try {
    await ChecklistListsAPI.updateItem(item.id, { done: !item.done });
    await loadBoard();
  } catch {
    useAlert('Não foi possível atualizar a tarefa.');
  }
}

async function removeItem(item) {
  try {
    await ChecklistListsAPI.deleteItem(item.id);
    await loadBoard();
  } catch {
    useAlert('Não foi possível apagar a tarefa.');
  }
}

async function createRoutine() {
  const title = newRoutineTitle.value.trim();
  if (!title) return;
  try {
    await ChecklistBoardAPI.createRoutine(title);
    newRoutineTitle.value = '';
    await loadBoard();
  } catch {
    useAlert('Não foi possível salvar a tarefa fixa.');
  }
}

async function toggleRoutine(routine) {
  try {
    await ChecklistBoardAPI.updateRoutine(routine.id, { enabled: !routine.enabled });
    await loadBoard();
  } catch {
    useAlert('Não foi possível atualizar a tarefa fixa.');
  }
}

async function removeRoutine(routine) {
  try {
    await ChecklistBoardAPI.deleteRoutine(routine.id);
    await loadBoard();
  } catch {
    useAlert('Não foi possível apagar a tarefa fixa.');
  }
}

watch([selectedDay, filterMode], loadBoard);
onMounted(loadBoard);
</script>

<template>
  <section class="crm-task-board flex h-full min-h-0 w-full text-n-slate-12">
    <aside class="crm-task-board__aside flex w-72 shrink-0 flex-col border-r border-n-weak">
      <header class="px-4 py-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#00a884]">
          Quadro pessoal
        </p>
        <h1 class="mt-1 text-lg font-semibold tracking-tight">Tarefas e Checklist</h1>
        <p class="mt-1 text-xs text-n-slate-11">
          Só o seu dia: fixas, pendências e desempenho.
        </p>
      </header>

      <div class="flex flex-col gap-3 border-b border-n-weak px-4 py-3">
        <label class="text-xs text-n-slate-11">
          Dia
          <input
            v-model="selectedDay"
            type="date"
            class="mt-1 w-full rounded-xl border border-n-weak bg-n-surface-1 px-3 py-2 text-sm"
          />
        </label>
        <div class="flex gap-2" role="group" aria-label="Filtrar desempenho">
          <button
            type="button"
            class="flex-1 rounded-xl px-2 py-2 text-sm font-medium"
            :class="filterMode === 'day' ? 'bg-[#00a884] text-white' : 'bg-n-alpha-1'"
            @click="filterMode = 'day'"
          >
            Dia
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl px-2 py-2 text-sm font-medium"
            :class="filterMode === 'month' ? 'bg-[#00a884] text-white' : 'bg-n-alpha-1'"
            @click="filterMode = 'month'"
          >
            Mês
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-n-slate-11">
          Tarefas fixas diárias
        </p>
        <p class="mt-1 text-xs text-n-slate-11">
          Aparecem todo dia só para você.
        </p>
        <ul class="mt-3 flex flex-col gap-2">
          <li
            v-for="routine in board.routines || []"
            :key="routine.id"
            class="flex items-center gap-2 rounded-xl border border-n-weak px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              class="size-4 accent-[#00a884]"
              :checked="routine.enabled"
              :aria-label="`Ativar ${routine.title}`"
              @change="toggleRoutine(routine)"
            />
            <span class="min-w-0 flex-1 truncate" :class="{ 'text-n-slate-11 line-through': !routine.enabled }">
              {{ routine.title }}
            </span>
            <button type="button" class="text-xs text-n-slate-11" @click="removeRoutine(routine)">
              Apagar
            </button>
          </li>
        </ul>
      </div>

      <form class="flex gap-2 border-t border-n-weak p-3" @submit.prevent="createRoutine">
        <input
          v-model="newRoutineTitle"
          type="text"
          maxlength="200"
          placeholder="Nova fixa diária"
          class="min-w-0 flex-1 rounded-xl border border-n-weak bg-n-surface-1 px-3 py-2 text-sm"
        />
        <button type="submit" class="shrink-0 rounded-xl bg-[#00a884] px-3 text-sm font-semibold text-white">
          Fixar
        </button>
      </form>
    </aside>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <section class="shrink-0 border-b border-n-weak px-6 py-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#00a884]">
              Desempenho
            </p>
            <p class="mt-1 text-sm text-n-slate-11">
              Sequência {{ stats?.streak || 0 }} dias · atrasadas {{ stats?.pending_carry || 0 }}
            </p>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <article class="crm-task-board__rate px-3 py-2 text-center">
              <p class="text-[11px] text-n-slate-11">Dia</p>
              <p class="text-xl font-semibold tabular-nums">{{ dayRate }}%</p>
            </article>
            <article class="crm-task-board__rate px-3 py-2 text-center">
              <p class="text-[11px] text-n-slate-11">Semana</p>
              <p class="text-xl font-semibold tabular-nums">{{ weekRate }}%</p>
            </article>
            <article class="crm-task-board__rate px-3 py-2 text-center">
              <p class="text-[11px] text-n-slate-11">Mês</p>
              <p class="text-xl font-semibold tabular-nums">{{ monthRate }}%</p>
            </article>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1" aria-label="Heatmap de conclusões">
          <span
            v-for="cell in heatmap"
            :key="cell.day"
            class="size-2.5 rounded-[3px]"
            :class="heatClass(cell.count)"
            :title="`${cell.day}: ${cell.count}`"
          />
        </div>

        <div v-if="trendRows.length" class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          <div
            v-for="row in trendRows.slice(-7)"
            :key="row.day || row.month"
            class="rounded-xl border border-n-weak px-2 py-2 text-xs"
          >
            <p class="text-n-slate-11">{{ row.day || row.month }}</p>
            <p class="mt-1 font-semibold tabular-nums">{{ row.rate }}%</p>
            <p class="text-n-slate-11">{{ row.completed }}/{{ row.total }}</p>
          </div>
        </div>
      </section>

      <div v-if="loading" class="m-auto text-sm text-n-slate-11">Carregando...</div>
      <div v-else class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <section v-if="pendingItems.length" class="mb-6">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[#e5484d]">
            Pendentes de dias anteriores
          </p>
          <ul class="flex flex-col gap-2">
            <li
              v-for="item in pendingItems"
              :key="item.id"
              class="crm-task-board__item is-carry flex items-center gap-3 px-3 py-2.5"
            >
              <input type="checkbox" class="size-4 accent-[#00a884]" :aria-label="`Concluir ${item.title}`" @change="toggleItem(item)" />
              <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ item.title }}</span>
              <span class="shrink-0 text-[11px] text-n-slate-11">{{ item.due_on }}</span>
              <button type="button" class="text-xs text-n-slate-11" @click="removeItem(item)">Apagar</button>
            </li>
          </ul>
        </section>

        <section class="mb-6">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-n-slate-11">
            Fixas de hoje
          </p>
          <p v-if="!fixedItems.length" class="text-sm text-n-slate-11">
            Nenhuma fixa para este dia. Cadastre à esquerda.
          </p>
          <ul v-else class="flex flex-col gap-2">
            <li
              v-for="item in fixedItems"
              :key="item.id"
              class="crm-task-board__item flex items-center gap-3 px-3 py-2.5"
            >
              <input type="checkbox" class="size-4 accent-[#00a884]" :aria-label="`Concluir ${item.title}`" @change="toggleItem(item)" />
              <span class="min-w-0 flex-1 truncate text-sm">{{ item.title }}</span>
            </li>
          </ul>
        </section>

        <section class="mb-6">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-n-slate-11">
            Do dia ({{ openCount }} em aberto)
          </p>
          <ul class="flex flex-col gap-2">
            <li
              v-for="item in adhocItems"
              :key="item.id"
              class="crm-task-board__item flex items-center gap-3 px-3 py-2.5"
            >
              <input type="checkbox" class="size-4 accent-[#00a884]" :aria-label="`Concluir ${item.title}`" @change="toggleItem(item)" />
              <span class="min-w-0 flex-1 truncate text-sm">{{ item.title }}</span>
              <button type="button" class="text-xs text-n-slate-11" @click="removeItem(item)">Apagar</button>
            </li>
          </ul>
        </section>

        <section v-if="doneItems.length">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-n-slate-11">
            Concluídas
          </p>
          <ul class="flex flex-col gap-2">
            <li
              v-for="item in doneItems"
              :key="item.id"
              class="crm-task-board__item is-done flex items-center gap-3 px-3 py-2.5"
            >
              <input
                type="checkbox"
                class="size-4 accent-[#00a884]"
                checked
                :aria-label="`Reabrir ${item.title}`"
                @change="toggleItem(item)"
              />
              <span class="min-w-0 flex-1 truncate text-sm text-n-slate-11 line-through">
                {{ item.title }}
              </span>
              <span class="shrink-0 text-[11px] text-n-slate-11">
                {{ item.done_at ? new Date(item.done_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '' }}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <form class="flex gap-2 border-t border-n-weak px-6 py-3" @submit.prevent="createItem">
        <input
          v-model="newItemTitle"
          type="text"
          maxlength="200"
          placeholder="Nova tarefa do dia"
          class="min-w-0 flex-1 rounded-xl border border-n-weak bg-n-surface-1 px-3 py-2.5 text-sm"
        />
        <button type="submit" class="shrink-0 rounded-xl bg-[#00a884] px-4 text-sm font-semibold text-white">
          Adicionar
        </button>
      </form>
    </div>
  </section>
</template>
