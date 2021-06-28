import { Exercise } from "./exercise.model";
import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Subscription } from 'rxjs';

import { map, take } from 'rxjs/operators';
import { UIService } from "../shared/ui.service";
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';
import { Store } from "@ngrx/store";

@Injectable()
export class TrainingService {

    private fbSubs: Subscription[] = [];
    
    constructor(private db: AngularFirestore, private uiService : UIService, private store: Store<fromTraining.State>) {}

    fetchAvailableExercies() {
        this.store.dispatch(new UI.StartLoading());
       this.fbSubs.push(this.db.collection('availableExercises').snapshotChanges().pipe(
            map(docArray => {
              return docArray.map(doc => {
                return {
                  id: doc.payload.doc.id,
                  ...doc.payload.doc.data() as Exercise
                };
              });
            })
        )
        .subscribe((exercises : Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new Training.SetAvailableTrainings(exercises))
        }, error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar('Fetching Exercises failed, please try again later', null, 3000)
        }));

    }

    startExercise(selectedId: string) {
        this.store.dispatch(new Training.StartTraining(selectedId));
    }

    completeExercise() {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe( ex => {
            this.addDataToDatabase({...ex, date: new Date(), state: 'completed'});
        })
        
        this.store.dispatch(new Training.StopTraining());
    }

    cancelExercise(progress : Number) {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDataToDatabase({
                ...ex, 
                date: new Date(), 
                state: 'cancelled', 
                duration: ex.duration * (+progress / 100),
                calories: ex.calories * (+progress / 100)
            });
        })
        this.store.dispatch(new Training.StopTraining());
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }

    fetchAllExercises() {
       this.fbSubs.push(this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: Exercise[]) => {
                this.store.dispatch(new Training.SetFinishedTrainings(exercises));
            }));
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}