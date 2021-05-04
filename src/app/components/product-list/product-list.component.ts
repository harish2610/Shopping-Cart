import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  //templateUrl: './product-list.component.html',
  //templateUrl: './product-list-table.component.html',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

products: Product[] = [];
currentCategoryId: number = 1;
previuosCategoryId: number = 1;
searchMode: boolean = false;

//new properties for pagination
thePageNumber: number = 1;
thePageSize: number = 5;
theTotalElements: number = 0;

previousKeyword: string = null;

  constructor(private productListService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute) {
    this.products = [];
   }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });  
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode) {
      this.handleSearchProducts();
    }
    else {
        this.handleListProducts();
    }
  }

handleListProducts(){
      //Check if id parameter is availaible
      const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

      if(hasCategoryId){
        this.currentCategoryId = +this.route.snapshot.paramMap.get('id');
      }
      else {
        this.currentCategoryId = 1;
      }

      // Check if we have a different category than previous
      //Note : Angular will reuse a component if it is currently being viewed

      // If we have a different category id than previous then set pageNumber back to 1.
      if(this.previuosCategoryId != this.currentCategoryId) {
        this.thePageNumber =1;
      }

      this.previuosCategoryId = this.currentCategoryId;

      console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
  
      this.productListService.getProductListPaginate(this.thePageNumber - 1,
                                                     this.thePageSize, 
                                                     this.currentCategoryId)
                                                     .subscribe(this.processResult());

}

processResult() {
  return data => {
    this.products = data._embedded.products;
    this.thePageNumber = data.page.number + 1;
    this.thePageSize = data.page.size;
    this.theTotalElements = data.page.totalElements;
  }
}

handleSearchProducts() {
  const theKeyword: string = this.route.snapshot.paramMap.get('keyword');
  
  // if we have different keyword than previous
  // then set the page number to 1

  if(this.previousKeyword != theKeyword) {
    this.thePageNumber = 1;
  }

  this.previousKeyword = theKeyword;

  console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

  //now search for products using keyword
  this.productListService.searchProductsPaginate(this.thePageNumber-1,
                                                this.thePageSize,
                                                theKeyword).subscribe(this.processResult());
}

updatePageSize(pageSize: number){
  this.thePageSize = pageSize;
  this.thePageNumber = 1;
  this.listProducts();
}

addToCart(theProduct: Product) {
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    //TODO.... do the real work
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
}

}
