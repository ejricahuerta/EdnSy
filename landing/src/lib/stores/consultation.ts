import { writable } from 'svelte/store';

export const consultationPopupOpen = writable(false);

export function openConsultationPopup() {
  consultationPopupOpen.set(true);
}

export function closeConsultationPopup() {
  consultationPopupOpen.set(false);
} 