import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductModel",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuthenticationModel",
      required: true,
    },

    idempotencyKey: {
      type: String,
      default: null,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "Order must contain at least one product.",
      },
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "RAZORPAY"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    walletDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupon: {
      type: String,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    shiprocket: {
      orderId: {
        type: Number,
        default: null,
        index: true,
      },
      shipmentId: {
        type: Number,
        default: null,
        index: true,
      },
      awbCode: {
        type: String,
        default: null,
        index: true,
      },
      courierId: {
        type: Number,
        default: null,
      },
      courierName: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        default: null,
      },
      statusCode: {
        type: Number,
        default: null,
      },
      syncStatus: {
        type: String,
        enum: ["not_created", "created", "awb_assigned", "pickup_scheduled", "cancelled", "failed"],
        default: "not_created",
      },
      package: {
        length: { type: Number, default: null },
        breadth: { type: Number, default: null },
        height: { type: Number, default: null },
        weight: { type: Number, default: null },
      },
      labelUrl: {
        type: String,
        default: null,
      },
      invoiceUrl: {
        type: String,
        default: null,
      },
      lastError: {
        type: String,
        default: null,
      },
      lastSyncedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({
  user: 1,
  "items.product": 1,
  orderStatus: 1,
  createdAt: -1,
});

export default mongoose.model("orders", OrderSchema);
