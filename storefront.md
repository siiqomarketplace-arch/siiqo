# Storefront API Documentation

This document provides details on the API endpoints for managing a vendor's storefront.

---

## 1. Create Storefront

Creates a new storefront for the authenticated vendor.

- **URL:** `/api/vendor/storefront`
- **Method:** `POST`
- **Headers:**
  - `Authorization`: `Bearer <your_jwt_token>`
  - `Content-Type`: `application/json`

### Request Payload

All fields are optional except `business_name`.

```json
{
    "business_name": "My New Awesome Store",
    "description": "The best new store on the internet.",
    "is_published": false,
    "address": "123 New St, Anytown, USA",
    "about": "We are just getting started.",
    "template_options": {
        "theme": "light",
        "font": "Roboto"
    }
}
```

### Success Response

- **Status Code:** `201 Created`
- **Body:**

```json
{
    "message": "Storefront created successfully",
    "storefront_id": 3
}
```

---

## 2. Update Storefront

Updates the details of an existing storefront for the authenticated vendor.

- **URL:** `/api/vendor/storefront`
- **Method:** `PUT`
- **Headers:**
  - `Authorization`: `Bearer <your_jwt_token>`
  - `Content-Type`: `application/json`

### Request Payload

Include any of the fields you wish to update.

```json
{
    "business_name": "My Updated Awesome Store",
    "is_published": true,
    "about": "We sell the best widgets and gadgets.",
    "template_options": {
        "theme": "dark",
        "font": "Arial"
    }
}
```

### Success Response

- **Status Code:** `200 OK`
- **Body:**

```json
{
    "message": "Storefront updated successfully"
}
```

---

## 3. Get Storefront Details

Retrieves the details of the authenticated vendor's storefront, including a list of their products.

- **URL:** `/api/vendor/storefront`
- **Method:** `GET`
- **Headers:**
  - `Authorization`: `Bearer <your_jwt_token>`

### Success Response

- **Status Code:** `200 OK`
- **Body:**

```json
{
    "storefront": {
        "id": 2,
        "business_name": "My Awesome Store",
        "description": "The best store on the internet now.",
        "is_published": true,
        "address": "123 Main St, Anytown, USA",
        "about": "We sell the best widgets.",
        "storefront_link": "my-awesome-store",
        "template_options": {
            "theme": "dark",
            "font": "Arial"
        },
        "state": "Rivers State",
        "phone": "+2347067532281",
        "country": "Nigeria",
        "email": "nwokedichibuike@gmail.com"
    },
    "products": [
        {
            "id": 1,
            "product_name": "Mini Q12",
            "product_price": 10500,
            "description": "Best model charger with AI camera.",
            "images": [
                "https://example.com/image1.jpg"
            ],
            "status": "active",
            "visibility": true,
            "category": "Electronics"
        }
    ]
}
```
