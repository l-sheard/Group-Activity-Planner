import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const eventsRef = (houseCode) => collection(db, "houses", houseCode, "events");
const eventDoc = (houseCode, id) => doc(db, "houses", houseCode, "events", id);
const wishlistRef = (houseCode) => collection(db, "houses", houseCode, "wishlist");
const wishlistDoc = (houseCode, id) => doc(db, "houses", houseCode, "wishlist", id);
const messagesRef = (houseCode, eventId) => collection(db, "houses", houseCode, "events", eventId, "messages");

export async function saveEvent(houseCode, editingId, payload, displayName) {
  if (editingId) {
    await updateDoc(eventDoc(houseCode, editingId), { ...payload, updatedAt: serverTimestamp(), updatedBy: displayName });
  } else {
    await addDoc(eventsRef(houseCode), {
      ...payload,
      createdAt: serverTimestamp(),
      createdBy: displayName,
      updatedAt: serverTimestamp(),
      updatedBy: displayName,
    });
  }
}

export async function deleteEvent(houseCode, id) {
  await deleteDoc(eventDoc(houseCode, id));
}

export async function moveEvent(houseCode, id, patch, displayName) {
  await updateDoc(eventDoc(houseCode, id), { ...patch, updatedAt: serverTimestamp(), updatedBy: displayName });
}

export async function setRsvp(houseCode, id, rsvps, plusOnes, displayName) {
  await updateDoc(eventDoc(houseCode, id), { rsvps, plusOnes, updatedAt: serverTimestamp(), updatedBy: displayName });
}

export async function setPlusOnes(houseCode, id, plusOnes, displayName) {
  await updateDoc(eventDoc(houseCode, id), { plusOnes, updatedAt: serverTimestamp(), updatedBy: displayName });
}

export async function sendChatMessage(houseCode, eventId, text, displayName) {
  await Promise.all([
    addDoc(messagesRef(houseCode, eventId), { text, author: displayName, createdAt: serverTimestamp() }),
    updateDoc(eventDoc(houseCode, eventId), { lastMessageAt: serverTimestamp(), lastMessageBy: displayName }),
  ]);
}

export async function addWishItem(houseCode, title, displayName) {
  await addDoc(wishlistRef(houseCode), { title, addedBy: displayName, addedAt: serverTimestamp() });
}

export async function deleteWishItem(houseCode, id) {
  await deleteDoc(wishlistDoc(houseCode, id));
}
