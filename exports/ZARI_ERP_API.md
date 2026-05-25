# ZARI ERP — API Reference

Auto-generated reference for the ZARI ERP backend. 436 endpoints across 45 modules.

## Authentication

Most endpoints require a Bearer JWT. Obtain one from `POST /api/auth/login` and send it as:

```
Authorization: Bearer <token>
```

## Table of Contents

- [Accounts · Credit/Debit Notes](#accounts-credit-debit-notes) (6)
- [Accounts · Dashboard](#accounts-dashboard) (1)
- [Accounts · Invoice Payments](#accounts-invoice-payments) (4)
- [Accounts · Invoices](#accounts-invoices) (10)
- [Accounts · Other Expenses](#accounts-other-expenses) (6)
- [Accounts · Purchases](#accounts-purchases) (8)
- [Accounts · Sales](#accounts-sales) (4)
- [Auth](#auth) (8)
- [Client Portal](#client-portal) (3)
- [Client Portal · Links](#client-portal-links) (9)
- [Dashboard Overview](#dashboard-overview) (1)
- [Health](#health) (1)
- [Inventory](#inventory) (26)
- [Inventory · Packing Lists](#inventory-packing-lists) (23)
- [Inventory · Shipping](#inventory-shipping) (13)
- [Lookups](#lookups) (2)
- [Masters · Artworks](#masters-artworks) (5)
- [Masters · Clients](#masters-clients) (9)
- [Masters · Costing](#masters-costing) (57)
- [Masters · Departments](#masters-departments) (7)
- [Masters · Fabrics](#masters-fabrics) (8)
- [Masters · HSN](#masters-hsn) (8)
- [Masters · Item Types](#masters-item-types) (8)
- [Masters · Items](#masters-items) (7)
- [Masters · Materials](#masters-materials) (8)
- [Masters · Packaging Materials](#masters-packaging-materials) (5)
- [Masters · Style Categories](#masters-style-categories) (8)
- [Masters · Styles](#masters-styles) (11)
- [Masters · Swatch Categories](#masters-swatch-categories) (8)
- [Masters · Swatches](#masters-swatches) (12)
- [Masters · Unit Types](#masters-unit-types) (7)
- [Masters · Vendors](#masters-vendors) (9)
- [Orders](#orders) (6)
- [Orders · Style](#orders-style) (6)
- [Orders · Style Products](#orders-style-products) (5)
- [Orders · Swatch](#orders-swatch) (6)
- [Procurement](#procurement) (17)
- [Procurement · Vendor Challans](#procurement-vendor-challans) (12)
- [Purchase Receipts](#purchase-receipts) (8)
- [Quotations](#quotations) (10)
- [Reports](#reports) (10)
- [Settings](#settings) (30)
- [Settings · User Management](#settings-user-management) (12)
- [Style Order Artworks](#style-order-artworks) (5)
- [Vendors · Ledger](#vendors-ledger) (7)

## Accounts · Credit/Debit Notes

### `GET /api/credit-debit-notes/`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 76)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/credit-debit-notes/`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 130)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Credit / Debit note created and balances updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/credit-debit-notes/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 263)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Draft notes can be deleted"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/credit-debit-notes/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 111)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Note not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/credit-debit-notes/{id}/apply`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 208)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "example": "Applied"
          }
        }
      },
      "message": {
        "type": "string",
        "example": "Note applied and balances updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/credit-debit-notes/{id}/cancel`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/creditDebitNotes.ts` (line 236)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "example": "Cancelled"
          }
        }
      },
      "message": {
        "type": "string",
        "example": "Note cancelled and balances reversed"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Dashboard

### `GET /api/accounts/dashboard`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountsDashboard.ts` (line 5)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "sales": {
        "type": "object",
        "properties": {
          "totalInvoiced": {},
          "totalReceived": {},
          "pendingReceivables": {},
          "invoiceCount": {}
        }
      },
      "purchases": {
        "type": "object",
        "properties": {
          "totalBills": {},
          "totalPaidVendors": {},
          "pendingPayables": {},
          "billCount": {}
        }
      },
      "procurement": {
        "type": "object",
        "properties": {
          "poCount": {},
          "approvedPos": {},
          "closedPos": {},
          "prCount": {}
        }
      },
      "expenses": {
        "type": "object",
        "properties": {
          "totalExpenses": {},
          "paidExpenses": {},
          "unpaidExpenses": {},
          "expenseCount": {}
        }
      },
      "shipping": {
        "type": "object",
        "properties": {
          "totalShippingCost": {},
          "shipmentCount": {},
          "deliveredCount": {}
        }
      },
      "netRevenue": {},
      "costingPaid": {},
      "trend": {},
      "topClients": {},
      "topVendors": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Invoice Payments

### `GET /api/invoice-payments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoicePayments.ts` (line 72)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `invoice_id` | query | no | string | Query parameter `invoice_id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "invoice_id required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/invoice-payments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoicePayments.ts` (line 91)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "invoice_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "currency_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "exchange_rate_snapshot": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "transaction_reference": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "invoice_status": {},
      "received_amount": {},
      "pending_amount": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid payment_status"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invoice not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/invoice-payments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoicePayments.ts` (line 175)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Payment not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/invoice-payments/accounts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoicePayments.ts` (line 17)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Invoices

### `GET /api/invoices`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 41)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/invoices`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 155)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/invoices/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 333)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/invoices/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 76)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/invoices/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 228)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/invoices/{id}/payment`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 314)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "receivedAmount": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/invoices/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 300)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "invoiceStatus": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid status"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/invoices/next-number`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 35)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/invoices/style/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 101)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/invoices/swatch/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/invoices.ts` (line 85)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Other Expenses

### `GET /api/other-expenses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 37)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "rows": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/other-expenses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 103)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "expense_category": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendor_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendor_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reference_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reference_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "currency_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "expense_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Expense recorded successfully and linked to vendor ledger"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Currency is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/other-expenses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 230)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/other-expenses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 86)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/other-expenses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 182)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "expense_category": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendor_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendor_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reference_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reference_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "currency_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "expense_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Amount must be greater than 0"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/other-expenses/categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/otherExpenses.ts` (line 19)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Purchases

### `GET /api/account-purchases/purchase-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 14)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/account-purchases/record-payment`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 432)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Vendor payment recorded successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-purchases/summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 113)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "purchaseOrders": {
            "type": "object",
            "properties": {
              "totalCount": {},
              "totalAmount": {},
              "pendingAmount": {}
            }
          },
          "purchaseReceipts": {
            "type": "object",
            "properties": {
              "totalCount": {},
              "receivedValue": {}
            }
          },
          "vendorBills": {
            "type": "object",
            "properties": {
              "totalCount": {},
              "totalAmount": {},
              "paidAmount": {},
              "pendingAmount": {}
            }
          },
          "paidToVendors": {
            "type": "object",
            "properties": {
              "totalCount": {},
              "totalPaid": {}
            }
          },
          "pendingPayables": {
            "type": "object",
            "properties": {
              "totalPending": {}
            }
          }
        }
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-purchases/top-vendors-pending`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 413)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-purchases/unified-liabilities`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 233)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-purchases/unified-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 154)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "poAmount": {},
      "prBills": {},
      "prBillsPaid": {},
      "prBillsPending": {},
      "outsourceAmount": {},
      "outsourcePaid": {},
      "outsourcePending": {},
      "otherExpenses": {},
      "otherPaid": {},
      "artisanCosts": {},
      "shippingCosts": {},
      "totalPaidVendors": {},
      "pendingPayables": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-purchases/vendor-bills`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 50)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/account-purchases/vendor-bills/{id}/payment`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountPurchases.ts` (line 80)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Payment recorded"
      },
      "paid": {},
      "pending": {},
      "status": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Accounts · Sales

### `POST /api/account-sales/record-payment`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountSales.ts` (line 277)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "source_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "ref_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "client_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "client_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "transaction_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "payment_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "currency_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "exchange_rate_snapshot": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invoice not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-sales/top-clients-pending`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountSales.ts` (line 113)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-sales/unified-receivables`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountSales.ts` (line 168)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/account-sales/unified-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/accountSales.ts` (line 5)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "total_invoice_amount": {},
      "total_received": {},
      "total_pending": {},
      "total_payments": {},
      "overdue_amount": {},
      "advance_total": {},
      "status_counts": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Auth

### `POST /api/auth/accept-invite`


Source: `artifacts/api-server/src/routes/auth.ts` (line 164)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Account activated. You can now sign in."
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid or expired invite link"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/auth/forgot-password`


Source: `artifacts/api-server/src/routes/auth.ts` (line 74)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": [
    "email"
  ]
}
```

_Validated against `ForgotPasswordBody` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "This account has been deactivated. Please contact your administrator."
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No account found with this email address. Please check and try again."
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to send reset email. Please try again or contact support."
      }
    }
  }
  ```

---

### `GET /api/auth/invite/{token}`


Source: `artifacts/api-server/src/routes/auth.ts` (line 150)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `token` | path | yes | string | Path parameter `token` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "username": {},
          "email": {}
        }
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid or expired invite link"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/auth/login`


Source: `artifacts/api-server/src/routes/auth.ts` (line 27)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string"
    }
  },
  "required": [
    "email",
    "password"
  ]
}
```

_Validated against `LoginBody` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Account is disabled"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/auth/logout`


Source: `artifacts/api-server/src/routes/auth.ts` (line 69)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/auth/me`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/auth.ts` (line 204)

**Responses:**

- **200** — Success
- **401** — Unauthorized

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not authenticated"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/auth/my-permissions`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/auth.ts` (line 191)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "permissions": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/auth/reset-password`


Source: `artifacts/api-server/src/routes/auth.ts` (line 123)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string"
    },
    "newPassword": {
      "type": "string"
    }
  },
  "required": [
    "token",
    "newPassword"
  ]
}
```

_Validated against `ResetPasswordBody` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid or expired reset token"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Client Portal

### `GET /api/client-portal/{token}`


Source: `artifacts/api-server/src/routes/clientPortal.ts` (line 10)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `token` | path | yes | string | Path parameter `token` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "link": {
            "type": "object",
            "properties": {
              "id": {},
              "token": {},
              "portalTitle": {}
            }
          },
          "order": {
            "type": "object",
            "properties": {
              "id": {},
              "orderCode": {},
              "swatchName": {},
              "clientName": {},
              "description": {},
              "quantity": {},
              "fabricName": {},
              "deliveryDate": {},
              "orderStatus": {},
              "priority": {},
              "isChargeable": {},
              "department": {}
            }
          },
          "artworks": {},
          "messages": {}
        }
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "This link is not yet published"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Order not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/client-portal/{token}/feedback`


Source: `artifacts/api-server/src/routes/clientPortal.ts` (line 118)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `token` | path | yes | string | Path parameter `token` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid decision"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Thread is closed"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Link not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/client-portal/{token}/message`


Source: `artifacts/api-server/src/routes/clientPortal.ts` (line 85)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `token` | path | yes | string | Path parameter `token` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "artworkId and message or attachment required"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "This thread has been closed"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Link not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Client Portal · Links

### `PATCH /api/client-links/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 36)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/client-links/{id}/feedback`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 101)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/client-links/{id}/messages`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 137)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/client-links/{id}/messages`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 152)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "artworkId and message or attachment required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/client-links/{id}/regenerate`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 86)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/client-links/{id}/threads/toggle`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 176)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/client-links/feedback/{feedbackId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 113)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `feedbackId` | path | yes | string | Path parameter `feedbackId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/client-links/style/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 23)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/client-links/swatch/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clientLinks.ts` (line 10)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Dashboard Overview

### `GET /api/dashboard/overview`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/dashboardOverview.ts` (line 5)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "kpi": {
        "type": "object",
        "properties": {
          "styleOrders": {
            "type": "object",
            "properties": {
              "total": {},
              "active": {},
              "thisMonth": {},
              "pctChange": {}
            }
          },
          "swatchOrders": {
            "type": "object",
            "properties": {
              "total": {},
              "active": {},
              "thisMonth": {},
              "pctChange": {}
            }
          },
          "artworks": {
            "type": "object",
            "properties": {
              "total": {},
              "thisMonth": {},
              "pctChange": {}
            }
          },
          "activeClients": {
            "type": "object",
            "properties": {
              "total": {},
              "thisMonth": {},
              "pctChange": {}
            }
          }
        }
      },
      "trend": {},
      "styleStatuses": {},
      "swatchStatuses": {},
      "recentOrders": {},
      "invoiceStats": {
        "type": "object",
        "properties": {
          "generated": {
            "type": "object",
            "properties": {
              "count": {},
              "amount": {}
            }
          },
          "pending": {
            "type": "object",
            "properties": {
              "count": {},
              "amount": {}
            }
          },
          "completed": {
            "type": "object",
            "properties": {
              "count": {},
              "amount": {}
            }
          },
          "overdue": {
            "type": "object",
            "properties": {
              "count": {},
              "amount": {}
            }
          }
        }
      },
      "activityFeed": {},
      "vendorPending": {
        "type": "object",
        "properties": {
          "totalPending": {},
          "formatted": {},
          "billCount": {}
        }
      },
      "openPrCount": {},
      "artworkPipeline": {},
      "heatmap": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Health

### `GET /api/healthz`


Source: `artifacts/api-server/src/routes/health.ts` (line 4)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Inventory

### `GET /api/inventory/adjustments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1015)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load adjustments"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/inventory/adjustments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1068)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "id": {},
          "revenueLoss": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Stock adjustment applied successfully and inventory updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Inventory item not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/inventory/adjustments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1253)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Inventory item not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/inventory/adjustments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1158)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "revenueLoss": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Adjustment updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Inventory item not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/adjustments/summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 994)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load adjustment summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/dashboard`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1315)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "summary": {},
      "reservations": {},
      "procurement": {},
      "totalConsumed": {},
      "topConsumed": {},
      "stockTrend": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load inventory dashboard"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/filters`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 263)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "categories": {},
      "departments": {},
      "locations": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load filters"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/item-categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1296)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load item categories"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/items`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 54)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load inventory items"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/items/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 172)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load item"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/inventory/items/{id}/add-image`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1462)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "image": {},
      "images": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only PNG, JPEG, WEBP, or GIF images are allowed"
      }
    }
  }
  ```
- **413** — Response with status 413

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Image exceeds 5 MB limit"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/items/{id}/logs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 197)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load stock logs"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/items/{id}/reservations`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 214)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "item_name": {},
      "source_type": {},
      "style_reserved_qty": {},
      "swatch_reserved_qty": {},
      "swatch_orders": {},
      "style_orders": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load reservations"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/inventory/items/{id}/stock`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 512)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "warehouseLocation": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "currentStock": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "averagePrice": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "lastPurchasePrice": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "minimumLevel": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reorderLevel": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "maximumLevel": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "department": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to update stock"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/ledger`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 280)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load ledger"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/inventory/ledger/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 426)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "deleted": {
        "type": "boolean",
        "example": true
      },
      "reversed": {
        "type": "boolean",
        "example": true
      },
      "newStock": {},
      "newAvailable": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete ledger entry"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/inventory/ledger/wastage`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 374)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "itemId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reason": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceNumber": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Quantity must be a positive number"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to record wastage"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/low-stock-alerts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 1426)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to fetch low-stock alerts"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/reservations`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 647)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "rows": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load reservations"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/inventory/reservations`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 711)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "inventoryId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reservationType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reservedQuantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reservationDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Inventory item not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/inventory/reservations/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 955)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/inventory/reservations/{id}/cancel`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 817)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Active reservations can be cancelled"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/inventory/reservations/{id}/convert`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 850)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      },
      "consumedQty": {},
      "releasedQty": {},
      "wastageQty": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/inventory/reservations/{id}/release`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 776)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Active reservations can be released"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/inventory/summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 7)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/inventory/sync`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/inventory.ts` (line 618)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Sync failed"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Inventory · Packing Lists

### `GET /api/delivery-addresses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 22)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `client_id` | query | no | string | Query parameter `client_id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/delivery-addresses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 43)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "client_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "label": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line1": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line2": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "city": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "state": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "pincode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "is_default": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Country must contain only letters"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/delivery-addresses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 113)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Address is used by a packing list and cannot be deleted"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/delivery-addresses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 71)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "label": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line1": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line2": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "city": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "state": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "pincode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "is_default": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Pincode must be exactly 6 digits"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/eligible-orders-for-packing`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 122)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `client_id` | query | no | string | Query parameter `client_id` |
| `delivery_address_id` | query | no | string | Query parameter `delivery_address_id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "swatches": {},
      "styles": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "client_id is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 158)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `client_id` | query | no | string | Query parameter `client_id` |
| `shipment_id` | query | no | string | Query parameter `shipment_id` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/packing-lists`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 333)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "client_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "delivery_address_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "destination_country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "packages": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Packing list created successfully with package details"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/packing-lists/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 509)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 208)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "packages": {}
        }
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Packing list not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/packing-lists/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 412)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "delivery_address_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "destination_country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "packages": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/{id}/eligible-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 892)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "swatches": {},
      "styles": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/packing-lists/{id}/packages`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 519)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "length": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "width": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "height": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "net_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gross_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": {}
          }
        }
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Packing list not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/packing-lists/{id}/packages/{pkgId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 568)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/packing-lists/{id}/packages/{pkgId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 547)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "length": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "width": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "height": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "net_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gross_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "items": {}
        }
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Package not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/packing-lists/{id}/packages/{pkgId}/items`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 612)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "item_source": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "order_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "order_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "order_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unit": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "item_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "inventory_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "inventory_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "deducted_from_location": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid item_source"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Inventory item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/packing-lists/{id}/packages/{pkgId}/items/{itemId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 763)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |
| `itemId` | path | yes | string | Path parameter `itemId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/packing-lists/{id}/packages/{pkgId}/items/{itemId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 745)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |
| `itemId` | path | yes | string | Path parameter `itemId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unit": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "item_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/packing-lists/{id}/packages/{pkgId}/items/{itemId}/image`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 877)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |
| `itemId` | path | yes | string | Path parameter `itemId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/packing-lists/{id}/packages/{pkgId}/items/{itemId}/image`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 848)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |
| `pkgId` | path | yes | string | Path parameter `pkgId` |
| `itemId` | path | yes | string | Path parameter `itemId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No file uploaded"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/{id}/pdf-html`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 942)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object"
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Packing list not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/inventory/search`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 576)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "type must be 'material' or 'fabric'"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/item-images/{filename}`


Source: `artifacts/api-server/src/routes/packingLists.ts` (line 804)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | yes | string | Path parameter `filename` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object"
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Image not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/packing-lists/order-artwork-image`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packingLists.ts` (line 817)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "type and item_id required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Inventory · Shipping

### `GET /api/shipping/details`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 190)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/shipping/details`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 265)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "reference_type": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reference_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "client_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipping_vendor_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "tracking_number": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "tracking_url": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "manual_shipping_amount_override": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "expected_delivery_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "actual_delivery_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Shipping details added successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Tracking number already exists for this vendor"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Shipping vendor not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/shipping/details/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 384)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Shipping record deleted"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/shipping/details/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 249)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/shipping/details/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 315)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "shipping_vendor_id": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "tracking_number": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "tracking_url": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_weight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "manual_shipping_amount_override": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shipment_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "expected_delivery_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "actual_delivery_date": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Shipping details updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Tracking number already exists for this vendor"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Shipping vendor not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/shipping/details/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 366)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "shipment_status": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Shipment status updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid shipment status"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/shipping/details/by-reference`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 230)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "referenceType and referenceId are required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/shipping/vendors`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 76)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/shipping/vendors`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 114)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "vendor_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_person": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "phone_number": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "email_address": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "weight_rate_per_kg": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "minimum_charge": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Shipping vendor created"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor name is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/shipping/vendors/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 166)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Vendor deleted"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/shipping/vendors/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 131)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "vendor_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_person": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "phone_number": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "email_address": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "weight_rate_per_kg": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "minimum_charge": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Shipping vendor updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor name is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/shipping/vendors/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 151)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/shipping/vendors/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/shipping.ts` (line 92)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Lookups

### `GET /api/lookups/{type}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/lookups.ts` (line 17)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `type` | path | yes | string | Path parameter `type` |

**Responses:**

- **200** — Success
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unknown lookup type"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/lookups/{type}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/lookups.ts` (line 24)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `type` | path | yes | string | Path parameter `type` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Name is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unknown lookup type"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Name already exists"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Artworks

### `GET /api/artworks`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/artworks.ts` (line 23)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "swatchOrderId is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/artworks`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/artworks.ts` (line 50)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "swatchOrderId is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/artworks.ts` (line 180)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/artworks.ts` (line 40)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/artworks.ts` (line 105)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Clients

### `GET /api/clients`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 30)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/clients`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 66)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "brandName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "contactName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "altEmail": {
      "type": "string",
      "format": "email"
    },
    "contactNo": {
      "type": "string",
      "minLength": 1
    },
    "altContactNo": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "countryOfOrigin": {
      "type": "string"
    },
    "hasGst": {
      "type": "boolean",
      "default": false
    },
    "gstNo": {
      "type": "string"
    },
    "address1": {
      "type": "string"
    },
    "address2": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "pincode": {
      "type": "string"
    },
    "addresses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "Billing Address",
              "Delivery Address",
              "Other"
            ]
          },
          "name": {
            "type": "string"
          },
          "contactNo": {
            "type": "string"
          },
          "address1": {
            "type": "string"
          },
          "address2": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "pincode": {
            "type": "string"
          },
          "country": {
            "type": "string"
          },
          "isBillingDefault": {
            "type": "boolean"
          }
        },
        "required": [
          "id",
          "type",
          "name",
          "contactNo",
          "address1",
          "address2",
          "city",
          "state",
          "pincode",
          "country",
          "isBillingDefault"
        ]
      }
    },
    "invoiceCurrency": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "brandName",
    "contactName",
    "email",
    "contactNo"
  ]
}
```

_Validated against `insertClientSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Contact Name must contain only letters and spaces."
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/clients/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 136)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Client deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Client not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/clients/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 58)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Client not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/clients/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 95)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "brandName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "contactName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "altEmail": {
      "type": "string",
      "format": "email"
    },
    "contactNo": {
      "type": "string",
      "minLength": 1
    },
    "altContactNo": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "countryOfOrigin": {
      "type": "string"
    },
    "hasGst": {
      "type": "boolean",
      "default": false
    },
    "gstNo": {
      "type": "string"
    },
    "address1": {
      "type": "string"
    },
    "address2": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "pincode": {
      "type": "string"
    },
    "addresses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "Billing Address",
              "Delivery Address",
              "Other"
            ]
          },
          "name": {
            "type": "string"
          },
          "contactNo": {
            "type": "string"
          },
          "address1": {
            "type": "string"
          },
          "address2": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "pincode": {
            "type": "string"
          },
          "country": {
            "type": "string"
          },
          "isBillingDefault": {
            "type": "boolean"
          }
        },
        "required": [
          "id",
          "type",
          "name",
          "contactNo",
          "address1",
          "address2",
          "city",
          "state",
          "pincode",
          "country",
          "isBillingDefault"
        ]
      }
    },
    "invoiceCurrency": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateClientSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Contact Name must contain only letters and spaces."
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Client not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/clients/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 126)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Client not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/clients/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 53)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/clients/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 45)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/clients/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/clients.ts` (line 146)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Costing

### `POST /api/costing/artisan-timesheets`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1327)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "swatchOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "noOfArtisans": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "startDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "endDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shiftType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "totalHours": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hourlyRate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "swatchOrderId, startDate, endDate and shiftType are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/artisan-timesheets/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1378)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/costing/artisan-timesheets/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1352)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Timesheet entry not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/artisan-timesheets/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1319)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/bom`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 609)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "reservation": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/bom/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 842)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/costing/bom/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 648)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/bom/{id}/log`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 830)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/costing/bom/{id}/qty`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 784)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "changed": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "BOM row not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/bom/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 568)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/consumption`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1105)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inventoryUpdated": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "BOM item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/consumption/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1258)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      },
      "inventoryUpdated": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/costing/consumption/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1181)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inventoryUpdated": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "BOM row not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/consumption/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1097)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/costing-payments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 2173)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "referenceType and referenceId are required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/costing-payments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 2192)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "swatchOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentMode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentAmount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentStatus": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "transactionId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "updated": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "vendorId, referenceType, referenceId, paymentAmount are required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/costing-payments-totals`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 2147)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "referenceType required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to fetch payment totals"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/costing-payments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 2291)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/costing/costing-payments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 2258)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "paymentType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentMode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentAmount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentStatus": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "transactionId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "paymentDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/custom-charges`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1448)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "swatchOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnCode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstPercentage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unitPrice": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "swatchOrderId, vendorId, hsnId and description are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/custom-charges/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1499)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/costing/custom-charges/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1473)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Custom charge not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/custom-charges/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1440)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/hsn-search`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1303)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `q` | query | no | string | Query parameter `q` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/invoice-items`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1918)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `type` | query | no | string | Query parameter `type` |
| `orderId` | query | no | string | Query parameter `orderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "shippingAmount": {},
      "orderId": {},
      "type": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "type (Swatch|Style) and orderId are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/material-search`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 533)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `q` | query | no | string | Query parameter `q` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/outsource-jobs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1391)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "swatchOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnCode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstPercentage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "issueDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "targetDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "deliveryDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "totalCost": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "swatchOrderId, vendorId, hsnId and issueDate are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/outsource-jobs/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1435)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/costing/outsource-jobs/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1414)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Outsource job not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/outsource-jobs/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1383)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/payments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1075)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/payments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1092)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/payments/{prId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1067)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `prId` | path | yes | string | Path parameter `prId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/po`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 891)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/po-action`


Source: `artifacts/api-server/src/routes/costing.ts` (line 2306)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object"
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/po/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 958)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/costing/po/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 943)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/po/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 883)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/pr`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 971)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PO not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/costing/pr/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1062)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/costing/pr/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1048)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/pr/{swatchOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 963)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `swatchOrderId` | path | yes | string | Path parameter `swatchOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-artisan-timesheets`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1823)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "noOfArtisans": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "startDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "endDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shiftType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "totalHours": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hourlyRate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId, startDate, endDate and shiftType are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-artisan-timesheets/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1815)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-bom`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1549)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "reservation": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-bom/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1504)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-consumption`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1739)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inventoryUpdated": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "BOM item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-consumption/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1731)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-custom-charges`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1891)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnCode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstPercentage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unitPrice": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId, vendorId, hsnId and description are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-custom-charges/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1883)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-outsource-jobs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1858)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "styleOrderProductName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "hsnCode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstPercentage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "issueDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "targetDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "deliveryDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "totalCost": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId, vendorId, hsnId and issueDate are required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-outsource-jobs/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1850)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-po`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1596)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-po/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1588)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/costing/style-pr`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1656)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PO not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/style-pr/{styleOrderId}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1648)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `styleOrderId` | path | yes | string | Path parameter `styleOrderId` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/costing/vendor-search`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/costing.ts` (line 1287)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `q` | query | no | string | Query parameter `q` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Departments

### `GET /api/departments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 18)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/departments`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 41)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name"
  ]
}
```

_Validated against `insertDepartmentSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Department Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/departments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 129)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Department deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Department not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/departments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 94)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateDepartmentSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Department not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Department Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/departments/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 116)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Department not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/departments/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 33)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/departments/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/departments.ts` (line 55)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Fabrics

### `GET /api/fabrics`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 57)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `fabricType` | query | no | string | Query parameter `fabricType` |
| `vendor` | query | no | string | Query parameter `vendor` |
| `hsnCode` | query | no | string | Query parameter `hsnCode` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/fabrics`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 175)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {},
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/fabrics/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 267)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Fabric deleted"
      },
      "record": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Fabric not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/fabrics/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 210)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {},
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Fabric not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/fabrics/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 249)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Fabric not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/fabrics/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 90)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/fabrics/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 78)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `fabricType` | query | no | string | Query parameter `fabricType` |
| `vendor` | query | no | string | Query parameter `vendor` |
| `hsnCode` | query | no | string | Query parameter `hsnCode` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/fabrics/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/fabrics.ts` (line 97)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No rows provided."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · HSN

### `GET /api/hsn`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 27)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/hsn`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 61)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "hsnCode": {
      "type": "string"
    },
    "gstPercentage": {
      "type": "string",
      "enum": [
        "0",
        "5",
        "12",
        "18",
        "28"
      ]
    },
    "remarks": {
      "type": "string",
      "maxLength": 500
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "hsnCode",
    "gstPercentage"
  ]
}
```

_Validated against `insertHsnSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "HSN Code already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/hsn/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 209)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "HSN record deleted"
      },
      "record": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "HSN record not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/hsn/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 140)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "hsnCode": {
      "type": "string"
    },
    "gstPercentage": {
      "type": "string",
      "enum": [
        "0",
        "5",
        "12",
        "18",
        "28"
      ]
    },
    "remarks": {
      "type": "string",
      "maxLength": 500
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateHsnSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "HSN record not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "HSN Code already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/hsn/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 181)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "HSN record not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/hsn/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 52)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/hsn/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 44)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/hsn/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/hsn.ts` (line 89)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array of HSN records."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Item Types

### `GET /api/item-types`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 89)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/item-types`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 111)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name"
  ]
}
```

_Validated against `insertItemTypeSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item type name already exists"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/item-types/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 167)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Item type deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item type not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/item-types/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 129)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateItemTypeSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item type not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "An item type with this name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/item-types/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 157)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item type not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/item-types/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 80)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/item-types/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 19)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/item-types/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/itemTypes.ts` (line 34)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "succeeded": {},
      "failed": {},
      "results": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No rows provided."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Items

### `GET /api/items`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 134)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/items`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 157)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "itemName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "itemType": {
      "type": "string",
      "default": ""
    },
    "description": {
      "type": "string"
    },
    "unitType": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "unitPrice": {
      "type": "string",
      "minLength": 1
    },
    "hsnCode": {
      "type": "string"
    },
    "gstPercent": {
      "type": "string"
    },
    "currentStock": {
      "type": "string",
      "default": "0"
    },
    "locationStocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string"
          },
          "stock": {
            "type": "string"
          }
        },
        "required": [
          "location",
          "stock"
        ]
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "id",
          "name",
          "data",
          "size"
        ]
      }
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "itemName",
    "unitType",
    "unitPrice"
  ]
}
```

_Validated against `insertItemSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/items/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 284)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Item deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/items/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 211)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "itemName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "itemType": {
      "type": "string",
      "default": ""
    },
    "description": {
      "type": "string"
    },
    "unitType": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "unitPrice": {
      "type": "string",
      "minLength": 1
    },
    "hsnCode": {
      "type": "string"
    },
    "gstPercent": {
      "type": "string"
    },
    "currentStock": {
      "type": "string",
      "default": "0"
    },
    "locationStocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string"
          },
          "stock": {
            "type": "string"
          }
        },
        "required": [
          "location",
          "stock"
        ]
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "id",
          "name",
          "data",
          "size"
        ]
      }
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateItemSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/items/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 270)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Item not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/items/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 39)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/items/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/items.ts` (line 55)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "succeeded": {},
      "failed": {},
      "results": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No rows provided."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Materials

### `GET /api/materials`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 152)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `hsnCode` | query | no | string | Query parameter `hsnCode` |
| `type` | query | no | string | Query parameter `type` |
| `vendor` | query | no | string | Query parameter `vendor` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/materials`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 194)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "materialName": {
      "type": "string"
    },
    "itemType": {
      "type": "string",
      "default": ""
    },
    "quality": {
      "type": "string",
      "default": ""
    },
    "type": {
      "type": "string"
    },
    "color": {
      "type": "string"
    },
    "hexCode": {
      "type": "string"
    },
    "colorName": {
      "type": "string",
      "minLength": 1
    },
    "size": {
      "type": "string",
      "minLength": 1
    },
    "unitPrice": {
      "type": "string",
      "minLength": 1
    },
    "unitType": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "currentStock": {
      "type": "string",
      "minLength": 1
    },
    "locationStocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string"
          },
          "stock": {
            "type": "string"
          }
        },
        "required": [
          "location",
          "stock"
        ]
      }
    },
    "hsnCode": {
      "type": "string",
      "minLength": 1
    },
    "gstPercent": {
      "type": "string",
      "minLength": 1
    },
    "vendor": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "id",
          "name",
          "data",
          "size"
        ]
      }
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    }
  },
  "required": [
    "colorName",
    "size",
    "unitPrice",
    "unitType",
    "currentStock",
    "hsnCode",
    "gstPercent"
  ]
}
```

_Validated against `insertMaterialSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/materials/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 308)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Material deleted"
      },
      "record": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Material not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/materials/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 241)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "materialName": {
      "type": "string"
    },
    "itemType": {
      "type": "string",
      "default": ""
    },
    "quality": {
      "type": "string",
      "default": ""
    },
    "type": {
      "type": "string"
    },
    "color": {
      "type": "string"
    },
    "hexCode": {
      "type": "string"
    },
    "colorName": {
      "type": "string",
      "minLength": 1
    },
    "size": {
      "type": "string",
      "minLength": 1
    },
    "unitPrice": {
      "type": "string",
      "minLength": 1
    },
    "unitType": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "currentStock": {
      "type": "string",
      "minLength": 1
    },
    "locationStocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string"
          },
          "stock": {
            "type": "string"
          }
        },
        "required": [
          "location",
          "stock"
        ]
      }
    },
    "hsnCode": {
      "type": "string",
      "minLength": 1
    },
    "gstPercent": {
      "type": "string",
      "minLength": 1
    },
    "vendor": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "id",
          "name",
          "data",
          "size"
        ]
      }
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateMaterialSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Material not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/materials/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 290)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Material not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/materials/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 143)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/materials/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 38)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `hsnCode` | query | no | string | Query parameter `hsnCode` |
| `type` | query | no | string | Query parameter `type` |
| `vendor` | query | no | string | Query parameter `vendor` |

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/materials/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/materials.ts` (line 68)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "succeeded": {},
      "failed": {},
      "results": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No rows provided."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Packaging Materials

### `GET /api/packaging-materials`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packagingMaterials.ts` (line 27)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `itemType` | query | no | string | Query parameter `itemType` |
| `department` | query | no | string | Query parameter `department` |
| `vendor` | query | no | string | Query parameter `vendor` |
| `location` | query | no | string | Query parameter `location` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/packaging-materials`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packagingMaterials.ts` (line 60)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "itemType": {
      "type": "string"
    },
    "itemName": {
      "type": "string",
      "minLength": 1
    },
    "department": {
      "type": "string"
    },
    "size": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "unitPrice": {
      "type": "string"
    },
    "currentStock": {
      "type": "string"
    },
    "vendor": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "itemName"
  ]
}
```

_Validated against `insertPackagingMaterialSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/packaging-materials/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packagingMaterials.ts` (line 109)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/packaging-materials/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packagingMaterials.ts` (line 82)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "itemType": {
      "type": "string"
    },
    "itemName": {
      "type": "string",
      "minLength": 1
    },
    "department": {
      "type": "string"
    },
    "size": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "unitPrice": {
      "type": "string"
    },
    "currentStock": {
      "type": "string"
    },
    "vendor": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "reorderLevel": {
      "type": "string"
    },
    "minimumLevel": {
      "type": "string"
    },
    "maximumLevel": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updatePackagingMaterialSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Record not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/packaging-materials/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/packagingMaterials.ts` (line 97)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Record not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Style Categories

### `GET /api/style-categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 19)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/style-categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 49)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "categoryName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "categoryName"
  ]
}
```

_Validated against `insertStyleCategorySchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/style-categories/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 140)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Category deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/style-categories/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 106)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "categoryName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateStyleCategorySchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/style-categories/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 127)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/style-categories/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 42)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/style-categories/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 34)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/style-categories/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleCategories.ts` (line 63)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Styles

### `GET /api/styles`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 107)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `client` | query | no | string | Query parameter `client` |
| `location` | query | no | string | Query parameter `location` |
| `category` | query | no | string | Query parameter `category` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/styles`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 203)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "client": {
      "type": "string",
      "minLength": 1
    },
    "styleNo": {
      "type": "string"
    },
    "invoiceNo": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "attachLink": {
      "type": "string"
    },
    "placeOfIssue": {
      "type": "string"
    },
    "vendorPoNo": {
      "type": "string"
    },
    "shippingDate": {
      "type": "string"
    },
    "styleCategory": {
      "type": "string",
      "minLength": 1
    },
    "referenceSwatchId": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "client",
    "styleCategory"
  ]
}
```

_Validated against `insertStyleSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/styles/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 250)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Style deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/styles/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 194)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/styles/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 219)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "client": {
      "type": "string",
      "minLength": 1
    },
    "styleNo": {
      "type": "string"
    },
    "invoiceNo": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "attachLink": {
      "type": "string"
    },
    "placeOfIssue": {
      "type": "string"
    },
    "vendorPoNo": {
      "type": "string"
    },
    "shippingDate": {
      "type": "string"
    },
    "styleCategory": {
      "type": "string",
      "minLength": 1
    },
    "referenceSwatchId": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateStyleSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/styles/{id}/media`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 288)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "url and category are required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/styles/{id}/media`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 264)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No file uploaded"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/styles/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 240)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Style not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/styles/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 24)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `client` | query | no | string | Query parameter `client` |

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/styles/for-reference`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 166)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/styles/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styles.ts` (line 44)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "succeeded": {},
      "failed": {},
      "results": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No rows provided."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Swatch Categories

### `GET /api/swatch-categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 18)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatch-categories`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 48)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name"
  ]
}
```

_Validated against `insertSwatchCategorySchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/swatch-categories/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 139)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Category deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/swatch-categories/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 105)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateSwatchCategorySchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/swatch-categories/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 126)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Category not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatch-categories/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 41)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatch-categories/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 33)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatch-categories/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchCategories.ts` (line 62)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Swatches

### `GET /api/swatches`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 39)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatches`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 126)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "swatchName": {
      "type": "string",
      "minLength": 1
    },
    "client": {
      "type": "string"
    },
    "swatchCategory": {
      "type": "string"
    },
    "fabric": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "swatchDate": {
      "type": "string"
    },
    "length": {
      "type": "string"
    },
    "width": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "hours": {
      "type": "string"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": {}
      }
    },
    "colorName": {
      "type": "string"
    },
    "hexCode": {
      "type": "string"
    },
    "finishType": {
      "type": "string"
    },
    "gsm": {
      "type": "string"
    },
    "approvalStatus": {
      "type": "string",
      "default": "Pending"
    },
    "remarks": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "swatchName"
  ]
}
```

_Validated against `insertSwatchSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/swatches/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 189)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Swatch deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatches/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 118)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/swatches/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 155)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "swatchName": {
      "type": "string",
      "minLength": 1
    },
    "client": {
      "type": "string"
    },
    "swatchCategory": {
      "type": "string"
    },
    "fabric": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "swatchDate": {
      "type": "string"
    },
    "length": {
      "type": "string"
    },
    "width": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "hours": {
      "type": "string"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": {}
      }
    },
    "colorName": {
      "type": "string"
    },
    "hexCode": {
      "type": "string"
    },
    "finishType": {
      "type": "string"
    },
    "gsm": {
      "type": "string"
    },
    "approvalStatus": {
      "type": "string",
      "default": "Pending"
    },
    "remarks": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateSwatchSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/swatches/{id}/media`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 290)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "url and category are required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatches/{id}/media`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 266)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No file uploaded"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/swatches/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 179)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatches/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 60)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatches/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 53)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatches/for-reference`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 65)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatches/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatches.ts` (line 199)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "succeeded": {},
      "failed": {},
      "results": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No data provided"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Unit Types

### `GET /api/unit-types-master`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 18)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/unit-types-master`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 41)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name"
  ]
}
```

_Validated against `insertUnitTypeSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unit Type Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/unit-types-master/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 122)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Unit Type deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unit Type not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/unit-types-master/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 91)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": []
}
```

_Validated against `updateUnitTypeSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unit Type not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unit Type Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/unit-types-master/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 111)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Unit Type not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/unit-types-master/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 33)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/unit-types-master/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/unitTypes.ts` (line 53)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Masters · Vendors

### `GET /api/vendors`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 26)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendors`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 64)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "brandName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "contactName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "altEmail": {
      "type": "string",
      "format": "email"
    },
    "contactNo": {
      "type": "string"
    },
    "altContactNo": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "hasGst": {
      "type": "boolean",
      "default": false
    },
    "gstNo": {
      "type": "string"
    },
    "bankName": {
      "type": "string"
    },
    "accountNo": {
      "type": "string"
    },
    "ifscCode": {
      "type": "string"
    },
    "bankAccounts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "bankName": {
            "type": "string"
          },
          "accountNo": {
            "type": "string"
          },
          "ifscCode": {
            "type": "string"
          }
        },
        "required": [
          "bankName",
          "accountNo",
          "ifscCode"
        ]
      }
    },
    "address1": {
      "type": "string"
    },
    "address2": {
      "type": "string"
    },
    "pincode": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "addresses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "Home",
              "Warehouse",
              "Office",
              "Factory",
              "Other"
            ]
          },
          "name": {
            "type": "string"
          },
          "contactNo": {
            "type": "string"
          },
          "address1": {
            "type": "string"
          },
          "address2": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "pincode": {
            "type": "string"
          },
          "country": {
            "type": "string"
          },
          "isBillingDefault": {
            "type": "boolean"
          }
        },
        "required": [
          "id",
          "type",
          "name",
          "contactNo",
          "address1",
          "address2",
          "city",
          "state",
          "pincode",
          "country",
          "isBillingDefault"
        ]
      }
    },
    "paymentAttachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "brandName",
    "contactName"
  ]
}
```

_Validated against `insertVendorSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "A vendor with this Brand / Vendor Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/vendors/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 171)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Vendor deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendors/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 56)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/vendors/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 138)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "brandName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "contactName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "altEmail": {
      "type": "string",
      "format": "email"
    },
    "contactNo": {
      "type": "string"
    },
    "altContactNo": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "hasGst": {
      "type": "boolean",
      "default": false
    },
    "gstNo": {
      "type": "string"
    },
    "bankName": {
      "type": "string"
    },
    "accountNo": {
      "type": "string"
    },
    "ifscCode": {
      "type": "string"
    },
    "bankAccounts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "bankName": {
            "type": "string"
          },
          "accountNo": {
            "type": "string"
          },
          "ifscCode": {
            "type": "string"
          }
        },
        "required": [
          "bankName",
          "accountNo",
          "ifscCode"
        ]
      }
    },
    "address1": {
      "type": "string"
    },
    "address2": {
      "type": "string"
    },
    "pincode": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "addresses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "Home",
              "Warehouse",
              "Office",
              "Factory",
              "Other"
            ]
          },
          "name": {
            "type": "string"
          },
          "contactNo": {
            "type": "string"
          },
          "address1": {
            "type": "string"
          },
          "address2": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "pincode": {
            "type": "string"
          },
          "country": {
            "type": "string"
          },
          "isBillingDefault": {
            "type": "boolean"
          }
        },
        "required": [
          "id",
          "type",
          "name",
          "contactNo",
          "address1",
          "address2",
          "city",
          "state",
          "pincode",
          "country",
          "isBillingDefault"
        ]
      }
    },
    "paymentAttachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateVendorSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "A vendor with this Brand / Vendor Name already exists."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/vendors/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 159)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendors/all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 49)

**Responses:**

- **200** — Success
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendors/export-all`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 41)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendors/import`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendors.ts` (line 81)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "imported": {},
      "skipped": {},
      "errors": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Request body must be a non-empty array."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Orders

### `GET /api/orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 10)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `search` | query | no | string | Query parameter `search` |
| `status` | query | no | string | Query parameter `status` |
| `orderType` | query | no | string | Query parameter `orderType` |
| `page` | query | no | string | Query parameter `page` |
| `limit` | query | no | string | Query parameter `limit` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 52)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "orderType": {
      "type": "string",
      "enum": [
        "swatch",
        "style"
      ]
    },
    "client": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "type": "string",
      "default": "Pending"
    },
    "priority": {
      "type": "string",
      "default": "Medium"
    },
    "assignedTo": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "remarks": {
      "type": "string"
    },
    "productionMode": {
      "type": "string",
      "default": "in-house"
    },
    "costStatus": {
      "type": "string",
      "default": "Pending"
    },
    "approvalStatus": {
      "type": "string",
      "default": "Pending"
    },
    "invoiceStatus": {
      "type": "string",
      "default": "Not Issued"
    },
    "invoiceNumber": {
      "type": "string"
    },
    "paymentStatus": {
      "type": "string",
      "default": "Unpaid"
    },
    "fabric": {
      "type": "string"
    },
    "swatchLength": {
      "type": "string"
    },
    "swatchWidth": {
      "type": "string"
    },
    "quantity": {
      "type": "string"
    },
    "referenceSwatchId": {
      "type": "string"
    },
    "referenceStyleId": {
      "type": "string"
    },
    "product": {
      "type": "string"
    },
    "pattern": {
      "type": "string"
    },
    "sizeBreakdown": {
      "type": "string"
    },
    "colorVariants": {
      "type": "string"
    },
    "materials": {
      "type": "string"
    },
    "consumption": {
      "type": "string"
    },
    "artisanAssignment": {
      "type": "string"
    },
    "outsourceAssignment": {
      "type": "string"
    },
    "artworkHours": {
      "type": "string"
    },
    "artworkRate": {
      "type": "string"
    },
    "artworkFeedback": {
      "type": "string"
    },
    "materialCost": {
      "type": "string"
    },
    "artisanCost": {
      "type": "string"
    },
    "outsourceCost": {
      "type": "string"
    },
    "customCharges": {
      "type": "string"
    },
    "totalCost": {
      "type": "string"
    },
    "clientComments": {
      "type": "string"
    },
    "shareLink": {
      "type": "string"
    }
  },
  "required": [
    "orderType",
    "client"
  ]
}
```

_Validated against `insertOrderSchema` (Zod schema)._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 112)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Order deleted"
      },
      "record": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Order not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 43)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Order not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 68)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "orderType": {
      "type": "string",
      "enum": [
        "swatch",
        "style"
      ]
    },
    "client": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "type": "string",
      "default": "Pending"
    },
    "priority": {
      "type": "string",
      "default": "Medium"
    },
    "assignedTo": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "remarks": {
      "type": "string"
    },
    "productionMode": {
      "type": "string",
      "default": "in-house"
    },
    "costStatus": {
      "type": "string",
      "default": "Pending"
    },
    "approvalStatus": {
      "type": "string",
      "default": "Pending"
    },
    "invoiceStatus": {
      "type": "string",
      "default": "Not Issued"
    },
    "invoiceNumber": {
      "type": "string"
    },
    "paymentStatus": {
      "type": "string",
      "default": "Unpaid"
    },
    "fabric": {
      "type": "string"
    },
    "swatchLength": {
      "type": "string"
    },
    "swatchWidth": {
      "type": "string"
    },
    "quantity": {
      "type": "string"
    },
    "referenceSwatchId": {
      "type": "string"
    },
    "referenceStyleId": {
      "type": "string"
    },
    "product": {
      "type": "string"
    },
    "pattern": {
      "type": "string"
    },
    "sizeBreakdown": {
      "type": "string"
    },
    "colorVariants": {
      "type": "string"
    },
    "materials": {
      "type": "string"
    },
    "consumption": {
      "type": "string"
    },
    "artisanAssignment": {
      "type": "string"
    },
    "outsourceAssignment": {
      "type": "string"
    },
    "artworkHours": {
      "type": "string"
    },
    "artworkRate": {
      "type": "string"
    },
    "artworkFeedback": {
      "type": "string"
    },
    "materialCost": {
      "type": "string"
    },
    "artisanCost": {
      "type": "string"
    },
    "outsourceCost": {
      "type": "string"
    },
    "customCharges": {
      "type": "string"
    },
    "totalCost": {
      "type": "string"
    },
    "clientComments": {
      "type": "string"
    },
    "shareLink": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateOrderSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Order not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/orders/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/orders.ts` (line 90)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "orderType": {
      "type": "string",
      "enum": [
        "swatch",
        "style"
      ]
    },
    "client": {
      "type": "string",
      "minLength": 1
    },
    "status": {
      "type": "string",
      "default": "Pending"
    },
    "priority": {
      "type": "string",
      "default": "Medium"
    },
    "assignedTo": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "remarks": {
      "type": "string"
    },
    "productionMode": {
      "type": "string",
      "default": "in-house"
    },
    "costStatus": {
      "type": "string",
      "default": "Pending"
    },
    "approvalStatus": {
      "type": "string",
      "default": "Pending"
    },
    "invoiceStatus": {
      "type": "string",
      "default": "Not Issued"
    },
    "invoiceNumber": {
      "type": "string"
    },
    "paymentStatus": {
      "type": "string",
      "default": "Unpaid"
    },
    "fabric": {
      "type": "string"
    },
    "swatchLength": {
      "type": "string"
    },
    "swatchWidth": {
      "type": "string"
    },
    "quantity": {
      "type": "string"
    },
    "referenceSwatchId": {
      "type": "string"
    },
    "referenceStyleId": {
      "type": "string"
    },
    "product": {
      "type": "string"
    },
    "pattern": {
      "type": "string"
    },
    "sizeBreakdown": {
      "type": "string"
    },
    "colorVariants": {
      "type": "string"
    },
    "materials": {
      "type": "string"
    },
    "consumption": {
      "type": "string"
    },
    "artisanAssignment": {
      "type": "string"
    },
    "outsourceAssignment": {
      "type": "string"
    },
    "artworkHours": {
      "type": "string"
    },
    "artworkRate": {
      "type": "string"
    },
    "artworkFeedback": {
      "type": "string"
    },
    "materialCost": {
      "type": "string"
    },
    "artisanCost": {
      "type": "string"
    },
    "outsourceCost": {
      "type": "string"
    },
    "customCharges": {
      "type": "string"
    },
    "totalCost": {
      "type": "string"
    },
    "clientComments": {
      "type": "string"
    },
    "shareLink": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateOrderSchema` (Zod schema)._

**Responses:**

- **200** — Success
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Validation failed"
      },
      "details": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Order not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Orders · Style

### `GET /api/style-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 21)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/style-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 68)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleName": {
      "type": "string",
      "minLength": 1
    },
    "styleNo": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    },
    "clientName": {
      "type": "string"
    },
    "quantity": {
      "type": "string"
    },
    "priority": {
      "type": "string",
      "default": "Medium"
    },
    "orderStatus": {
      "type": "string",
      "default": "Draft"
    },
    "season": {
      "type": "string"
    },
    "colorway": {
      "type": "string"
    },
    "sampleSize": {
      "type": "string"
    },
    "fabricType": {
      "type": "string"
    },
    "orderIssueDate": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "targetHours": {
      "type": "string"
    },
    "issuedTo": {
      "type": "string"
    },
    "department": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "internalNotes": {
      "type": "string"
    },
    "clientInstructions": {
      "type": "string"
    },
    "isChargeable": {
      "type": "boolean",
      "default": false
    },
    "isInhouse": {
      "type": "boolean",
      "default": false
    },
    "styleReferences": {
      "type": "array",
      "items": {}
    },
    "swatchReferences": {
      "type": "array",
      "items": {}
    },
    "refDocs": {
      "type": "array",
      "items": {}
    },
    "refImages": {
      "type": "array",
      "items": {}
    },
    "wipImages": {
      "type": "array",
      "items": {}
    },
    "finalImages": {
      "type": "array",
      "items": {}
    },
    "wipVideos": {
      "type": "array",
      "items": {}
    },
    "finalVideos": {
      "type": "array",
      "items": {}
    },
    "estimate": {
      "type": "array",
      "items": {}
    },
    "actualStartDate": {
      "type": "string"
    },
    "actualStartTime": {
      "type": "string"
    },
    "tentativeDeliveryDate": {
      "type": "string"
    },
    "actualCompletionDate": {
      "type": "string"
    },
    "actualCompletionTime": {
      "type": "string"
    },
    "delayReason": {
      "type": "string"
    },
    "cancelReason": {
      "type": "string"
    },
    "approvalDate": {
      "type": "string"
    }
  },
  "required": [
    "styleName"
  ]
}
```

_Validated against `insertStyleOrderSchema` (Zod schema)._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/style-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 122)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "This order has linked artworks or stock consumptions. Use 'Cancel Order' to deactivate it instead."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/style-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 59)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/style-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 85)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleName": {
      "type": "string",
      "minLength": 1
    },
    "styleNo": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    },
    "clientName": {
      "type": "string"
    },
    "quantity": {
      "type": "string"
    },
    "priority": {
      "type": "string",
      "default": "Medium"
    },
    "orderStatus": {
      "type": "string",
      "default": "Draft"
    },
    "season": {
      "type": "string"
    },
    "colorway": {
      "type": "string"
    },
    "sampleSize": {
      "type": "string"
    },
    "fabricType": {
      "type": "string"
    },
    "orderIssueDate": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "targetHours": {
      "type": "string"
    },
    "issuedTo": {
      "type": "string"
    },
    "department": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "internalNotes": {
      "type": "string"
    },
    "clientInstructions": {
      "type": "string"
    },
    "isChargeable": {
      "type": "boolean",
      "default": false
    },
    "isInhouse": {
      "type": "boolean",
      "default": false
    },
    "styleReferences": {
      "type": "array",
      "items": {}
    },
    "swatchReferences": {
      "type": "array",
      "items": {}
    },
    "refDocs": {
      "type": "array",
      "items": {}
    },
    "refImages": {
      "type": "array",
      "items": {}
    },
    "wipImages": {
      "type": "array",
      "items": {}
    },
    "finalImages": {
      "type": "array",
      "items": {}
    },
    "wipVideos": {
      "type": "array",
      "items": {}
    },
    "finalVideos": {
      "type": "array",
      "items": {}
    },
    "estimate": {
      "type": "array",
      "items": {}
    },
    "actualStartDate": {
      "type": "string"
    },
    "actualStartTime": {
      "type": "string"
    },
    "tentativeDeliveryDate": {
      "type": "string"
    },
    "actualCompletionDate": {
      "type": "string"
    },
    "actualCompletionTime": {
      "type": "string"
    },
    "delayReason": {
      "type": "string"
    },
    "cancelReason": {
      "type": "string"
    },
    "approvalDate": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateStyleOrderSchema` (Zod schema)._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/style-orders/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrders.ts` (line 104)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Orders · Style Products

### `GET /api/style-order-products`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderProducts.ts` (line 7)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/style-order-products`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderProducts.ts` (line 30)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleOrderId": {
      "type": "number"
    },
    "productName": {
      "type": "string",
      "minLength": 1
    },
    "styleCategoryId": {
      "type": "string"
    },
    "styleCategoryName": {
      "type": "string"
    },
    "productStatus": {
      "type": "string",
      "default": "Draft"
    },
    "fabricId": {
      "type": "string"
    },
    "fabricName": {
      "type": "string"
    },
    "hasLining": {
      "type": "boolean",
      "default": false
    },
    "liningFabricId": {
      "type": "string"
    },
    "liningFabricName": {
      "type": "string"
    },
    "unitLength": {
      "type": "string"
    },
    "unitWidth": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "orderIssueDate": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "targetHours": {
      "type": "string"
    },
    "issuedTo": {
      "type": "string"
    },
    "department": {
      "type": "string"
    },
    "refDocs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "refImages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "videos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternType": {
      "type": "string"
    },
    "patternMakingCost": {
      "type": "string"
    },
    "patternDoc": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternOuthouseDoc": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternVendorId": {
      "type": "string"
    },
    "patternVendorName": {
      "type": "string"
    },
    "patternPaymentType": {
      "type": "string"
    },
    "patternPaymentMode": {
      "type": "string"
    },
    "patternPaymentStatus": {
      "type": "string"
    },
    "patternPaymentAmount": {
      "type": "string"
    },
    "patternTransactionId": {
      "type": "string"
    },
    "patternPaymentDate": {
      "type": "string"
    },
    "patternRemarks": {
      "type": "string"
    }
  },
  "required": [
    "styleOrderId",
    "productName"
  ]
}
```

_Validated against `insertStyleOrderProductSchema` (Zod schema)._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/style-order-products/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderProducts.ts` (line 58)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/style-order-products/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderProducts.ts` (line 21)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/style-order-products/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderProducts.ts` (line 42)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "styleOrderId": {
      "type": "number"
    },
    "productName": {
      "type": "string",
      "minLength": 1
    },
    "styleCategoryId": {
      "type": "string"
    },
    "styleCategoryName": {
      "type": "string"
    },
    "productStatus": {
      "type": "string",
      "default": "Draft"
    },
    "fabricId": {
      "type": "string"
    },
    "fabricName": {
      "type": "string"
    },
    "hasLining": {
      "type": "boolean",
      "default": false
    },
    "liningFabricId": {
      "type": "string"
    },
    "liningFabricName": {
      "type": "string"
    },
    "unitLength": {
      "type": "string"
    },
    "unitWidth": {
      "type": "string"
    },
    "unitType": {
      "type": "string"
    },
    "orderIssueDate": {
      "type": "string"
    },
    "deliveryDate": {
      "type": "string"
    },
    "targetHours": {
      "type": "string"
    },
    "issuedTo": {
      "type": "string"
    },
    "department": {
      "type": "string"
    },
    "refDocs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "refImages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "videos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternType": {
      "type": "string"
    },
    "patternMakingCost": {
      "type": "string"
    },
    "patternDoc": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternOuthouseDoc": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "data": {
            "type": "string"
          },
          "size": {
            "type": "number"
          }
        },
        "required": [
          "name",
          "type",
          "data",
          "size"
        ]
      }
    },
    "patternVendorId": {
      "type": "string"
    },
    "patternVendorName": {
      "type": "string"
    },
    "patternPaymentType": {
      "type": "string"
    },
    "patternPaymentMode": {
      "type": "string"
    },
    "patternPaymentStatus": {
      "type": "string"
    },
    "patternPaymentAmount": {
      "type": "string"
    },
    "patternTransactionId": {
      "type": "string"
    },
    "patternPaymentDate": {
      "type": "string"
    },
    "patternRemarks": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    }
  },
  "required": []
}
```

_Validated against `updateStyleOrderProductSchema` (Zod schema)._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Orders · Swatch

### `GET /api/swatch-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 20)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/swatch-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 64)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Swatch Name is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/swatch-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 202)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "This order has linked artworks or stock consumptions. Use 'Cancel Order' to deactivate it instead."
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/swatch-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 54)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/swatch-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 124)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/swatch-orders/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/swatchOrders.ts` (line 183)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Procurement

### `GET /api/procurement/approved-pos`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 809)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load approved POs"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/item-tracking`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 761)

**Responses:**

- **200** — Success

  ```json
  {
    "oneOf": [
      {
        "type": "object",
        "properties": {}
      },
      {}
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load tracking"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/po-numbers`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 793)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/purchase-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 65)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase orders"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/procurement/purchase-orders`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 155)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "At least one item is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to create purchase order"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/procurement/purchase-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 265)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase Order deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Draft POs can be deleted"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PO not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete purchase order"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/purchase-orders/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 118)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "items": {},
      "receipts": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PO not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase order"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/procurement/purchase-orders/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 221)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PO not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to update PO status"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/purchase-receipts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 280)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase receipts"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/procurement/purchase-receipts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 374)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "pr_number": {}
        }
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to create purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/procurement/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 695)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase receipt deleted"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/procurement/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 344)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "items": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/procurement/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 539)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase receipt updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to update purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/procurement/purchase-receipts/{id}/cancel`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 619)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase receipt cancelled"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR is already cancelled"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to cancel purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/procurement/purchase-receipts/{id}/confirm`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 481)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase receipt confirmed and inventory updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to confirm purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/procurement/purchase-receipts/{id}/vendor-invoice`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 970)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete vendor invoice"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/procurement/purchase-receipts/{id}/vendor-invoice`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/procurement.ts` (line 888)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      },
      "file_path": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invoice amount is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to upload vendor invoice"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Procurement · Vendor Challans

### `GET /api/vendor-challans`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 31)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to fetch vendor challans"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-challans`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 74)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "challanDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "challanType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unit": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "rate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "attachment": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "lineItems": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Challan type is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to create vendor challan"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/vendor-challans/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 137)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Draft or Cancelled challans can be deleted"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendor-challans/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 65)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/vendor-challans/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 107)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "challanDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "challanType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "referenceOrderId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "description": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "quantity": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "unit": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "rate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "amount": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "attachment": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "lineItems": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Draft challans can be edited"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to update vendor challan"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/vendor-challans/{id}/cancel`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 176)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Cannot cancel a challan in this status"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/vendor-challans/{id}/document`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 400)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid ID"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-challans/{id}/document`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 378)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No file uploaded"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/vendor-challans/{id}/verify`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 150)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Only Draft challans can be verified"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "You do not have permission to verify challans"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-challans/convert-selected-to-po`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 287)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {},
      "poNumber": {},
      "count": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "All selected challans must belong to the same vendor"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to convert challans to PO"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-challans/convert-to-po`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 209)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "message": {
        "type": "string",
        "example": "Vendor challans converted to PO successfully"
      },
      "poNumber": {},
      "count": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No eligible Verified challans found for this selection"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to convert challans to PO"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-challans/preview-po`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorChallans.ts` (line 189)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "dateFrom": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor and Challan Type are required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to preview challans"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Purchase Receipts

### `GET /api/purchase-receipts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 126)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase receipts"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/purchase-receipts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 246)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "prDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "items": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "confirmNow": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase Receipt confirmed. Inventory updated successfully."
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Each item must have a positive quantity"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 435)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "deleted": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 223)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "items": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/purchase-receipts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 311)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "vendorId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "vendorName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "prDate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "remarks": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "items": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase Receipt updated successfully."
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "At least one item is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Confirmed PRs cannot be edited. Cancel it first."
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to update purchase receipt"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/purchase-receipts/{id}/cancel`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 402)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "PR cancelled. Inventory changes reversed."
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "PR is already cancelled"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to cancel purchase receipt"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/purchase-receipts/{id}/confirm`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 357)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Purchase Receipt confirmed. Inventory updated successfully."
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **422** — Unprocessable Entity

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "No items found on this PR"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/purchase-receipts/vendors/search`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/purchaseReceipts.ts` (line 467)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to search vendors"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Quotations

### `GET /api/quotations`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 36)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {},
      "page": {},
      "limit": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 131)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "clientId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientState": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "requirementSummary": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "estimatedWeight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "estimatedShippingCharges": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "internalNotes": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientNotes": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "designs": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "charges": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstRate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "coverPage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "coverPageImage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shippingRatePerKg": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "id": {},
          "quotationNumber": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Quotation saved successfully"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/quotations/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 288)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/quotations/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 98)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "designs": {},
          "charges": {},
          "feedback": {},
          "revisions": {}
        }
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Quotation not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/quotations/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 208)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "clientId": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientName": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientState": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "requirementSummary": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "estimatedWeight": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "estimatedShippingCharges": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "internalNotes": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "clientNotes": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "designs": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "charges": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstType": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gstRate": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "coverPage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "coverPageImage": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "shippingRatePerKg": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Quotation saved successfully"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Quotation not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations/{id}/convert-style`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 467)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "styleOrderId": {},
          "orderCode": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Quotation converted successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Already converted to Style"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations/{id}/convert-swatch`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 418)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "swatchOrderId": {},
          "orderCode": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Quotation converted successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Already converted to Swatch"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations/{id}/feedback`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 338)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Feedback added"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Feedback text is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations/{id}/revise`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 356)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "id": {},
          "quotationNumber": {},
          "revisionNumber": {}
        }
      },
      "message": {
        "type": "string",
        "example": "Revision created"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/quotations/{id}/status`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/quotations.ts` (line 300)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Another revision in this quotation chain is already Approved. Only one revision can be approved."
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Reports

### `GET /api/reports/client-ledger`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 189)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load client ledger"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/filter-options`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 13)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "clients": {},
      "vendors": {},
      "items": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load filter options"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/gst-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 318)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "summary": {},
      "netLiability": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load GST summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/invoice-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 132)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load invoice summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/order-profitability`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 218)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load order profitability"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/purchase-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 94)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/purchase-vs-sales`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 276)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "period": {},
            "total_sales": {},
            "total_purchases": {},
            "other_expenses": {},
            "net_revenue": {}
          }
        }
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load purchase vs sales"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/stock-movement`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 63)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load stock movement"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/stock-summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 31)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load stock summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/reports/vendor-ledger`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/reports.ts` (line 160)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load vendor ledger"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Settings

### `GET /api/settings/activity-logs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 435)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/activity-logs/action`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 483)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "description required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/activity-logs/users`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 505)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/bank-accounts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 365)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/bank-accounts`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 379)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "bank_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "account_no": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "ifsc_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "branch": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "account_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "bank_upi": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "is_default": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Account number is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/settings/bank-accounts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 425)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/settings/bank-accounts/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 395)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "bank_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "account_no": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "ifsc_code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "branch": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "account_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "bank_upi": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/bank-accounts/{id}/default`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 411)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/currencies`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 245)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/currencies/{code}/toggle`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 271)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `code` | path | yes | string | Path parameter `code` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Currency status updated"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Cannot deactivate the base currency"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Currency not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/currencies/base`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 255)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Currency code is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Currency not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/download-logs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 745)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "total": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/download-logs`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 715)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "file_type and file_name are required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/download-logs/users`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 783)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Admin only"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/exchange-rates`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 289)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/exchange-rates/{code}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 345)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `code` | path | yes | string | Path parameter `code` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "rate": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Valid positive rate is required"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Currency not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/exchange-rates/refresh`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 311)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/gst`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 583)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/settings/gst`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 600)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "company_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_address": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_phone": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_email": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_gstin": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_state": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "company_country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "export_under_lut_enabled": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "reverse_charge_enabled": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "gst_mode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "default_service_gst_rate": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "GST settings updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Default service GST rate must be 0 or greater"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/invoice-templates`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 660)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/invoice-templates/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 670)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "payment_terms": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Template not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/invoice-templates/{id}/set-default`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 684)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Template not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/my-permissions`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 697)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/password`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 208)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "current_password": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "new_password": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "confirm_password": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Password updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Current password is incorrect"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/profile`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 165)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "id": {},
          "name": {},
          "email": {},
          "phone_number": {},
          "profile_photo": {},
          "role": {}
        }
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PATCH /api/settings/profile`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 193)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "phone_number": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "profile_photo": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Profile updated successfully"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Name is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/settings/warehouses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 518)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/settings/warehouses`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 531)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line1": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line2": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "city": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "state": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "pincode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_phone": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_email": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "is_active": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Warehouse name is required"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/settings/warehouses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 572)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/settings/warehouses/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/settings.ts` (line 550)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "code": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line1": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "address_line2": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "city": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "state": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "pincode": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "country": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_name": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_phone": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "contact_email": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "is_active": {
      "type": "string",
      "description": "Inferred from handler usage"
    },
    "notes": {
      "type": "string",
      "description": "Inferred from handler usage"
    }
  },
  "additionalProperties": true
}
```

_Field types inferred from request usage in the handler._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Settings · User Management

### `GET /api/user-management/permissions`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 312)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/user-management/roles`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 488)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/user-management/roles`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 498)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "permissions": {
            "type": "array",
            "items": {}
          }
        }
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Role name is required"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Role already exists"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/user-management/roles/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 528)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Role deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Cannot delete a system role"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Role not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/user-management/roles/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 509)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "permissions": {}
        }
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Cannot rename a system role"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Role not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/user-management/roles/{id}/permissions`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 537)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "properties": {
          "permissions": {}
        }
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "permissions must be an array"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/user-management/users`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 316)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/user-management/users`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 333)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inviteToken": {},
      "inviteUrl": {},
      "emailSent": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "email, username and role are required"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "A user with that email already exists"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/user-management/users/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 419)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "User deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Cannot delete your own account"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "The superuser account cannot be deleted"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/user-management/users/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 379)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid email address"
      }
    }
  }
  ```
- **403** — Forbidden

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "The superuser account cannot be modified"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **409** — Conflict

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "That email is already in use by another account"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/user-management/users/{id}/resend-invite`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 434)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inviteToken": {},
      "inviteUrl": {},
      "emailSent": {
        "type": "boolean",
        "example": false
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **400** — Bad Request — validation failed

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/user-management/users/{id}/send-reset`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/userManagement.ts` (line 458)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {},
      "inviteToken": {},
      "inviteUrl": {},
      "emailSent": {
        "type": "boolean",
        "example": false
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Use the Forgot Password flow to reset your own password"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "User not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Style Order Artworks

### `GET /api/style-order-artworks`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderArtworks.ts` (line 21)

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/style-order-artworks`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderArtworks.ts` (line 57)

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "styleOrderId is required"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/style-order-artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderArtworks.ts` (line 253)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "example": "Deleted"
      }
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/style-order-artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderArtworks.ts` (line 46)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `PUT /api/style-order-artworks/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/styleOrderArtworks.ts` (line 105)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "data": {}
    }
  }
  ```
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Invalid id"
      }
    }
  }
  ```
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Not found"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

## Vendors · Ledger

### `POST /api/vendor-ledger/{vendorId}/charge`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 483)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `vendorId` | path | yes | string | Path parameter `vendorId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Charge date cannot be in the future"
      },
      "issues": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to add charge"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendor-ledger/{vendorId}/entries`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 140)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `vendorId` | path | yes | string | Path parameter `vendorId` |

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load ledger entries"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendor-ledger/{vendorId}/info`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 381)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `vendorId` | path | yes | string | Path parameter `vendorId` |

**Responses:**

- **200** — Success
- **404** — Not Found

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Vendor not found"
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load vendor"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `POST /api/vendor-ledger/{vendorId}/pay`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 395)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `vendorId` | path | yes | string | Path parameter `vendorId` |

**Request body** (`application/json`):

```json
{
  "type": "object",
  "additionalProperties": true
}
```

_Request body schema not statically detected._

**Responses:**

- **201** — Created
- **400** — Bad Request

  ```json
  {
    "type": "object",
    "properties": {
      "error": {},
      "issues": {}
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to record payment"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/vendor-ledger/charges/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 538)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete charge"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `DELETE /api/vendor-ledger/payments/{id}`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 528)

**Parameters:**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | yes | string | Path parameter `id` |

**Responses:**

- **200** — Success

  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "example": true
      }
    }
  }
  ```
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to delete payment"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---

### `GET /api/vendor-ledger/summary`

> 🔒 Requires Bearer token

Source: `artifacts/api-server/src/routes/vendorLedger.ts` (line 8)

**Responses:**

- **200** — Success
- **500** — Internal Server Error

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "example": "Failed to load vendor ledger summary"
      }
    }
  }
  ```
- **401** — Unauthorized — missing or invalid Bearer token

  ```json
  {
    "type": "object",
    "properties": {
      "error": {
        "type": "string",
        "description": "Human-readable error message"
      },
      "message": {
        "type": "string",
        "description": "Optional additional detail"
      }
    },
    "required": [
      "error"
    ]
  }
  ```

---
