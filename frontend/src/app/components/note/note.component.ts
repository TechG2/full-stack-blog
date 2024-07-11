import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { NoteService } from '../../services/note.service';

export interface Note {
  noteId: number;
  msg: string;
  isError: boolean;
}

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.css',
})
export class NoteComponent implements OnInit, OnDestroy {
  @ViewChild('noteDiv') noteDiv: ElementRef<HTMLDivElement>;
  note: Note = { noteId: Date.now(), msg: '', isError: false };

  circleXMark = faCircleXmark;
  circleCheck = faCircleCheck;

  private noteSubscription: Subscription;

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.noteSubscription = this.noteService.noteActive.subscribe(
      (noteInfo) => {
        this.note = noteInfo;
        this.active();
      }
    );
  }
  ngOnDestroy(): void {
    this.noteSubscription.unsubscribe();
  }

  active() {
    this.noteDiv.nativeElement.classList.remove('translate-x-full');
    setTimeout(
      () => this.noteDiv.nativeElement.classList.add('translate-x-full'),
      5000
    );
  }
}
