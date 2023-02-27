import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { BookType } from 'src/models/BookTypes';
import { DatePipe } from '@angular/common';
import { Book } from 'src/models/Book';

@Component({
  selector: 'booklist',
  templateUrl: './booklist.component.html',
  styleUrls: ['./booklist.component.css']
})

export class BooklistComponent implements OnInit {
  bookForm: FormGroup; // add book form
  bookManipulateForm: FormGroup; // update/dde book form
  displayedColumns: string[] = ['position', 'Name', 'Start', 'Finish', 'Page', 'Author'];
  dataSource: MatTableDataSource<Book>;
  books: Book | any = [];

  constructor(
    private fb: FormBuilder,
    private bookservice: BookService,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.createBookForm();
    this.createBookManipulateForm();

  }
  ngOnInit(): void { this.retrieveBooks() }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //================Creating book
  createBookForm() {
    this.bookForm = this.fb.group({
      bookname: ['', Validators.required],
      numberofpages: ['', Validators.required],
      authorname: ['', Validators.required],
    });
  }
  //================update/delete book
  createBookManipulateForm() {
    this.bookManipulateForm = this.fb.group({
      bookId: [],
      bookname: ['', Validators.required],
      numberofpages: ['', Validators.required],
      authorname: ['', Validators.required],
      startdate: ['', Validators.required],
      finishdate: ['', Validators.required],
    });
  }


  createBook(bookname: string, numberofpage: any | number, authorname?: string | any) {
    const book = new Book(bookname, numberofpage, new Date(), BookType.PERSONAL, undefined, undefined, authorname)
    this.bookservice.createBook(book).subscribe({
      next: (res) => {
        console.log(res)
        this.retrieveBooks();
      },
      error: async (err) => {
        //unvalid token
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['signin']);
        }
      }
    })
  }

  //================Retrieving book=============
  retrieveBooks() {
    this.books = []
    this.bookservice.retrieveBooks().subscribe({
      next: async (response) => {
        Object.entries(response).map((book: any, index) => {
          let obj: Book | any = {
            'bookId': book[0],
            'name': book[1].name,
            'startDate': this.datePipe.transform(book[1].startDate, 'yyyy-MM-dd'),
            'endDate': this.datePipe.transform(book[1].finisDate, 'yyyy-MM-dd'),
            'totalPage': book[1].totalPage,
            'author': book[1].author,

          }
          this.books.push(obj)
          this.dataSource = new MatTableDataSource<Book>(this.books);
        })
      },
      error: (err) => {
        if (err.status === 401) {
          this.deleteToken();
        }
      }, complete: () => {

      }
    })

  }

  // ===============delete - delete book==============  
  getTheBook(book: any): FormGroup {
    //to fill the form
    return this.bookManipulateForm = this.fb.group({
      bookId: [book.bookId, Validators.required],
      bookname: [book.name, Validators.required],
      numberofpages: [book.totalPage, Validators.required],
      authorname: [book.author, Validators.required],
      startdate: [book.startDate, Validators.required],
      finishdate: [book.endDate, Validators.required],
    });

  }


  deleteBook(form: FormGroup) {

    console.log(this.bookManipulateForm.get('bookId')?.value)
    this.bookservice.deleteBook(this.bookManipulateForm.get('bookId')?.value).subscribe({
      next: (response) => {
        this.retrieveBooks();
      },
      error: (err) => {
        console.log(err.message)
      }
    })
  }

  updateBook(book: Book) {
    this.bookManipulateForm = this.fb.group({
      bookname: [book.name, Validators.required],
      numberofpages: [book.totalPage, Validators.required],
      authorname: [book.author, Validators.required],
      startdate: [book.startDate, Validators.required],
      finishdate: [book.endDate, Validators.required],
    });
  }

  deleteToken() {
    localStorage.removeItem('token');
    this.router.navigate(['signin']);

  }

}
