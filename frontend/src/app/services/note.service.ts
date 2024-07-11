import { EventEmitter, Injectable } from '@angular/core';
import { Note } from '../components/note/note.component';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  noteActive: EventEmitter<Note> = new EventEmitter<Note>();

  constructor() {}

  activeNote(noteInfo: Note): void {
    this.noteActive.emit(noteInfo);
  }
}
