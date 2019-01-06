import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {
  Action,
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentChangeAction, DocumentSnapshot
} from '@angular/fire/firestore';
import {AuthService} from '../auth/auth.service';
import {TransactionTypeEnum} from '../../enums/transaction-type.enum';
import {IPeriod} from '../../models/period';
import {map, switchMap} from 'rxjs/operators';
import {ITransaction} from '../../models/transaction';
import {AngularFireAuth} from '@angular/fire/auth';
import {take} from 'rxjs/operators';
import {List} from "immutable";


@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private transactionsCollection: AngularFirestoreCollection<ITransaction>;
  private transactionsDoc: AngularFirestoreDocument<ITransaction>;

  constructor(private afs: AngularFirestore, private authService: AuthService, private afAuth: AngularFireAuth) {
  }

  private initializeData() {
    return this.authService.getCurrentUser().then(user => {
      // this.transactionsCollection = this.afs.collection<any>(this.getPath(user));
    });
  }

  getAllTransactions(): Observable<DocumentChangeAction<any>[]> {
    return this.transactionsCollection.snapshotChanges();
  }

  getTransactionsByDate(period: IPeriod): Observable<DocumentChangeAction<any>[]> {
    return this.authService.getCurrentUserObservable().pipe(take(1), switchMap(res => {
      this.transactionsCollection = this.afs.collection<any>(`users/${res.uid}/transactions`,
        ref => ref.where('date', '<=', period.endDate).where('date', '>=', period.startDate));
      return this.transactionsCollection.snapshotChanges();
    }));
  }

  private getPath(user): string {
    return `users/${user.uid}/transactions`;
  }

  delete(transaction: ITransaction): Observable<any> {
    if (transaction.id) {
      return from(this.transactionsCollection.doc(transaction.id).delete());
    }
  }

  getTransaction(transactionUid: string): Observable<Action<DocumentSnapshot<any>>> {
    return this.authService.getCurrentUserObservable().pipe(take(1), switchMap(res => {
      return this.afs.doc(`users/${res.uid}/transactions/${transactionUid}`).snapshotChanges();
    }));
    // return this.authService.getCurrentUser()
    //   .then(user => {
    //     console.log('UID' + user.uid);
    //     this.transactionsDoc = this.afs.doc(`users/${user.uid}/transactions/${transactionUid}`);
    //     this.transaction = this.transactionsDoc.valueChanges();
    //   }, err => {
    //     console.log(err);
    //   });


    // return fromPromise(this.authService.getCurrentUser()).pipe(switchMap(res => {
    //   console.log(res)
    //   return this.afs.doc<any>(`transactions$/${res.uid}/user_transactions/${transactionUid}`).valueChanges();
    // }));
    // console.log('get transaction');
    //    this.afs.doc<any>(`JP1VKSxi3BX196Clk7eHr1rxmLn1/transactions$/${transactionUid}`).snapshotChanges().pipe(map(res => {
    //
    //     console.log(res);
    //     return res.payload;
    //   })).subscribe(res => {
    //     console.log(res);
    //    });
  }

  saveParcels(transactions: ITransaction[]): Observable<any> {
    const batch = this.afs.firestore.batch();
    const idParcels = this.afs.createId();
    transactions.forEach(transaction => {
      if (transaction.id) {
        const transactionsRef = this.transactionsCollection.doc(transaction.id).ref;
        batch.update(transactionsRef, {...transaction});
      } else {
        const idBefore = this.afs.createId();
        transaction.id = idBefore;
        transaction.idParcels = idParcels;
        const userRef = this.transactionsCollection.doc(transaction.id).ref;
        console.log('CADASTRAR NOVO');
        batch.set(userRef, {...transaction});
      }
    });
    return from(batch.commit());
  }

  save(transaction: ITransaction): Observable<any> {
    if (transaction.id) {
      return from(this.transactionsCollection.doc(transaction.id).update(transaction));
    } else {
      const idBefore = this.afs.createId();
      transaction.id = idBefore;
      return from(this.transactionsCollection.doc(idBefore).set(transaction));
    }
  }

  addDefaultTransactions() {
    return this.initializeData().then(res => {
      const promises: Promise<any>[] = [];
      const defaultTransactions: ITransaction[] = [
        {
          name: 'Movimento 1',
          type: TransactionTypeEnum.OUTCOME,
          realized: false,
          amount: 120,
          date: new Date()
        },
        {
          name: 'Movimento 2',
          type: TransactionTypeEnum.OUTCOME,
          realized: false,
          amount: 120,
          date: new Date(new Date().setMonth(8))
        },
        {
          name: 'Movimento 3',
          type: TransactionTypeEnum.OUTCOME,
          realized: false,
          amount: 120,
          date: new Date(new Date().setMonth(7))
        },
        {
          name: 'Movimento 4',
          type: TransactionTypeEnum.OUTCOME,
          realized: false,
          amount: 120,
          date: new Date(new Date().setMonth(6))
        },
      ];
      for (const c of defaultTransactions) {
        promises.push(this.save(c).toPromise());
      }
      return promises;
    });
  }
}
