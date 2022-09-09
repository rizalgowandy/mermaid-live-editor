import type { HistoryEntry } from '$lib/types';
import { describe, it, expect } from 'vitest';
import {
	addHistoryEntry,
	injectHistoryIDs,
	clearHistoryData,
	historyModeStore,
	historyStore
} from './history';
import { defaultState } from '../../util/state';
import { get } from 'svelte/store';

describe('history', () => {
	it('should handle saving individual history entry', () => {
		expect(window.localStorage.getItem('manualHistoryStore')).toBe('[]');
		expect(window.localStorage.getItem('autoHistoryStore')).toBe('[]');

		addHistoryEntry({
			state: defaultState,
			time: 12345,
			type: 'manual'
		});

		const [manualEntry]: HistoryEntry[] = JSON.parse(
			window.localStorage.getItem('manualHistoryStore')
		);

		expect(manualEntry.time).toBe(12345);
		expect(manualEntry.type).toBe('manual');
		expect(manualEntry.name).not.toBeNull();
		expect(manualEntry.state).not.toBeNull();

		addHistoryEntry({
			state: defaultState,
			time: 54321,
			type: 'auto'
		});

		const [autoEntry]: HistoryEntry[] = JSON.parse(window.localStorage.getItem('autoHistoryStore'));

		expect(autoEntry.time).toBe(54321);
		expect(autoEntry.type).toBe('auto');
		expect(autoEntry.name).not.toBeNull();
		expect(autoEntry.state).not.toBeNull();

		historyModeStore.set('manual');
		clearHistoryData();
		historyModeStore.set('auto');
		clearHistoryData();
		expect(window.localStorage.getItem('manualHistoryStore')).toBe('[]');
		expect(window.localStorage.getItem('autoHistoryStore')).toBe('[]');
	});

	it('should clear history entries', () => {
		addHistoryEntry({
			state: defaultState,
			time: 12345,
			type: 'manual'
		});
		addHistoryEntry({
			state: { ...defaultState, code: 'graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)' },
			time: 123456,
			type: 'manual'
		});

		historyModeStore.set('manual');
		const store: HistoryEntry[] = get(historyStore);
		expect(store.length).toBe(2);
		clearHistoryData(store[1].id);
		expect(get(historyStore).length).toBe(1);
		clearHistoryData();
		expect(get(historyStore).length).toBe(0);

		historyModeStore.set('auto');
		addHistoryEntry({
			state: defaultState,
			time: 54321,
			type: 'auto'
		});
		addHistoryEntry({
			state: { ...defaultState, code: 'graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)' },
			time: 654321,
			type: 'auto'
		});
		expect(get(historyStore).length).toBe(2);
		clearHistoryData();
		expect(get(historyStore).length).toBe(0);
		// Test calling when history is empty
		clearHistoryData();
		expect(get(historyStore).length).toBe(0);
	});
});

describe('history migration', () => {
	it('should inject history IDs as migration', () => {
		window.localStorage.setItem(
			'manualHistoryStore',
			'[{"state":{"code":"graph TD\\n    A[Halloween] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"manual","name":"hollow-art"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"helpful-ocean"}]'
		);
		window.localStorage.setItem(
			'autoHistoryStore',
			'[{"state":{"code":"graph TD\\n    A[New Year] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"auto","name":"barking-dog"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"needy-mosquito"}]'
		);
		let manualHistoryStore: HistoryEntry[] = JSON.parse(
			window.localStorage.getItem('manualHistoryStore')
		);
		let autoHistoryStore: HistoryEntry[] = JSON.parse(
			window.localStorage.getItem('autoHistoryStore')
		);
		expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(false);
		expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(false);

		injectHistoryIDs();

		manualHistoryStore = JSON.parse(window.localStorage.getItem('manualHistoryStore'));
		autoHistoryStore = JSON.parse(window.localStorage.getItem('autoHistoryStore'));
		expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(true);
		expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(true);
	});
});
