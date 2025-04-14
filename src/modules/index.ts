import { bankController } from "./banks/bank.controller";
import { orderController } from "./orders/order.controller";
import { paymentMethodController } from "./payment-methods/payment-method.controller";
import { paymentTypeController } from "./payment-types/payment-type.controller";
import { productCategoryController } from "./product-categories/product-category.controller";
import { productController } from "./products/product.controller";
import { stockMovementController } from "./stock-movements/stock-movement.controller";


export const privateControllers = [
  bankController,
  orderController,
  paymentMethodController,
  paymentTypeController,
  productController,
  productCategoryController,
  stockMovementController,
]