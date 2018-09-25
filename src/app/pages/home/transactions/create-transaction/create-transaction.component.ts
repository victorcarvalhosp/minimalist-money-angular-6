import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {ITransaction} from '../../../../models/transaction';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validations} from '../../../../validators/validations';
import {AngularFirestore} from '@angular/fire/firestore';
import {TransactionsService} from '../../../../services/transactions/transactions.service';
import {ICategory} from "../../../../models/category";
import {CategoriesService} from "../../../../services/categories/categories.service";

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit {
  form: FormGroup;
  validations: Validations;
  loading: boolean = false;

  constructor(public dialogRef: MatDialogRef<CreateTransactionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ITransaction, private fb: FormBuilder, private db: AngularFirestore,
              public transactionsService: TransactionsService, public snackBar: MatSnackBar, public categoriesService: CategoriesService) {
    console.log('CONSTRUCTOR CALLED');
    this.createForm();
    this.form.patchValue(this.data);
    console.log(this.data.category);
    this.form.controls['category'].patchValue(this.data.category);
  }


  createForm() {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.required])],
      date: ['', Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
      category: ['', Validators.compose([Validators.required])],
      realized: [''],
    });
    this.createValidatorsMessages();
  }

  formValue() {
    console.log(this.form);
  }

  private createValidatorsMessages() {
    this.validations = new Validations(
      {
        'name': {
          'required': 'Transaction name is required.',
        },
        'amount': {
          'required': 'Amount is required.',
        },
        'category': {
          'required': 'Category is required.',
        }
      }
    );
  }


  getError(name: string) {
    const control = this.form.get(name);
    return this.validations.getControlErrors(control);
  }

  private showLoading() {
    this.loading = true;
  }

  private hideLoading() {
    this.loading = false;
  }


  tryDelete(value) {
    this.showLoading();
    this.transactionsService.deleteTransaction(value);
    this.hideLoading();
    this.closeDialog();
    this.openSnackBar('Transaction deleted!');
  }

  trySave(value) {
    this.showLoading();
    this.transactionsService.saveTransaction(value);
    this.hideLoading();
    this.closeDialog();
    this.openSnackBar('Transaction Saved!');
    // this.transactionsService.saveTransaction(value).then(res => {
    //   console.log('res');
    // });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 2000,
    });
  }

  seeValue(item) {
    console.log(item);
  }

  setCategoryValueOnForm(value) {
    this.form.get('category').setValue(value.value);
  }

  compareFn(x: ICategory, y: ICategory): boolean {
    console.log(x);
    console.log(y);
    console.log('CALLED COMPARE FN');
    return x && y ? x.id === y.id : x === y;
  }


}
