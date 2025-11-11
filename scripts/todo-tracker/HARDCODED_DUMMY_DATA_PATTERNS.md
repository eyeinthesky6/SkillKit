# Hardcoded Dummy/Fake Data Patterns

**Date:** 11-11-2025  
**Purpose:** Detect hardcoded dummy/fake data that indicates an app is not live or is a placeholder

---

## 🎯 Problem Statement

**Hardcoded dummy/fake data is a major indicator that an application is:**
- Not fully implemented
- A placeholder/demo
- Not live/production-ready
- Fake or dummy application

**AI learned from human codebases, so it uses the same shortcuts humans use!**

---

## ✅ Patterns Added

### 1. Hardcoded Dummy User Data ✅

**Patterns:**
- `John Doe`, `Jane Doe`, `Test User`, `Demo User`, `Sample User`
- `Example User`, `Dummy User`, `Fake User`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_USER
const user = { name: "John Doe" };

// ❌ DETECTED: HARDCODED_DUMMY_USER
const userName = "Test User";
```

### 2. Hardcoded Dummy Email ✅

**Patterns:**
- `test@example.com`, `user@example.com`, `admin@example.com`
- `demo@example.com`, `sample@example.com`, `dummy@example.com`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_EMAIL
const email = "test@example.com";

// ❌ DETECTED: HARDCODED_DUMMY_EMAIL
const userEmail = "user@example.com";
```

### 3. Hardcoded Dummy Password ✅ (CRITICAL)

**Patterns:**
- `password123`, `Password123`, `test123`, `Test123`
- `admin123`, `Admin123`, `demo123`, `Demo123`
- `password`, `Password`, `123456`, `qwerty`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_PASSWORD (CRITICAL!)
const password = "password123";

// ❌ DETECTED: HARDCODED_DUMMY_PASSWORD (CRITICAL!)
const adminPassword = "admin123";
```

### 4. Hardcoded Dummy Phone ✅

**Patterns:**
- `123-456-7890`, `555-555-5555`, `000-000-0000`
- `111-111-1111`, `999-999-9999`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_PHONE
const phone = "123-456-7890";

// ❌ DETECTED: HARDCODED_DUMMY_PHONE
const userPhone = "555-555-5555";
```

### 5. Lorem Ipsum Text ✅

**Patterns:**
- `lorem ipsum`, `Lorem Ipsum`, `LOREM IPSUM`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_LOREM_IPSUM
const description = "Lorem ipsum dolor sit amet";

// ❌ DETECTED: HARDCODED_LOREM_IPSUM
const content = "Lorem Ipsum is placeholder text";
```

### 6. Placeholder Text ✅

**Patterns:**
- `sample text`, `Sample Text`, `SAMPLE TEXT`
- `placeholder text`, `Placeholder Text`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_PLACEHOLDER_TEXT
const text = "sample text";

// ❌ DETECTED: HARDCODED_PLACEHOLDER_TEXT
const content = "Placeholder Text";
```

### 7. Hardcoded Dummy IDs ✅

**Patterns:**
- `userId: "123"`, `userId: "test"`, `userId: "demo"`
- `id: "12345"`, `id: "sample"`, `id: "dummy"`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_ID
const userId = "123";

// ❌ DETECTED: HARDCODED_DUMMY_ID
const id = "test";
```

### 8. Hardcoded Dummy URLs ✅

**Patterns:**
- `https://example.com`, `https://test.com`, `https://demo.com`
- `https://sample.com`, `https://dummy.com`, `https://fake.com`
- `localhost`, `127.0.0.1`
- URLs containing `example`, `test`, `demo`, `sample`, `dummy`, `fake`, `placeholder`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_URL
const apiUrl = "https://example.com/api";

// ❌ DETECTED: HARDCODED_DUMMY_URL
const endpoint = "https://test.example.com";
```

### 9. Hardcoded Dummy Addresses ✅

**Patterns:**
- `123 Main St`, `123 Main Street`, `123 Fake Street`
- `123 Test Street`, `123 Demo Street`, `123 Sample Street`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_ADDRESS
const address = "123 Main St";

// ❌ DETECTED: HARDCODED_DUMMY_ADDRESS
const street = "123 Fake Street";
```

### 10. Hardcoded Dummy Locations ✅

**Patterns:**
- `New York, USA`, `California, US`, `Test City, Test`
- `Demo City, Demo`, `Sample City, Sample`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_LOCATION
const location = "New York, USA";

// ❌ DETECTED: HARDCODED_DUMMY_LOCATION
const city = "Test City, Test";
```

### 11. Hardcoded Dummy Dates ✅

**Patterns:**
- `2024-01-01`, `2025-01-01`, `2000-01-01`
- `1990-01-01`, `1900-01-01`, `01/01/2024`, `01/01/2025`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_DATE
const date = "2024-01-01";

// ❌ DETECTED: HARDCODED_DUMMY_DATE
const createdAt = "01/01/2025";
```

### 12. Hardcoded Dummy Arrays ✅

**Patterns:**
- Arrays containing `John`, `Jane`, `Test`, `Demo`, `Sample`, `Dummy`, `Fake`, `Example`

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_ARRAY
const users = ["John", "Jane", "Test"];

// ❌ DETECTED: HARDCODED_DUMMY_ARRAY
const names = ["Demo", "Sample", "Dummy"];
```

### 13. Hardcoded Dummy Objects ✅

**Patterns:**
- Objects with `name`, `user`, `email`, `username` containing dummy values

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_OBJECT
const user = { name: "John", email: "test@example.com" };

// ❌ DETECTED: HARDCODED_DUMMY_OBJECT
const data = { user: "Test", username: "demo" };
```

### 14. Hardcoded Dummy API Responses ✅

**Patterns:**
- Responses with hardcoded `success`, `ok`, `true`
- Responses containing dummy user data

**Example:**
```typescript
// ❌ DETECTED: HARDCODED_DUMMY_RESPONSE
return { success: true, data: [] };

// ❌ DETECTED: HARDCODED_DUMMY_RESPONSE
return [{ name: "John", email: "test@example.com" }];
```

---

## 🎯 Key Insight

**AI learned from human codebases, so it uses the same shortcuts!**

- Humans hardcode dummy data to avoid full implementation
- AI learned this pattern from human code
- Both use the same shortcuts: `test@example.com`, `John Doe`, `password123`

---

## 📊 Detection Statistics

### Total Patterns Added: **14 new patterns**

#### Categories:
- **User Data:** 3 patterns (user, email, password)
- **Contact Info:** 1 pattern (phone)
- **Content:** 2 patterns (lorem ipsum, placeholder text)
- **Identifiers:** 1 pattern (IDs)
- **URLs:** 1 pattern
- **Location:** 2 patterns (address, location)
- **Dates:** 1 pattern
- **Data Structures:** 3 patterns (array, object, response)

---

## ✅ Implementation Status

### Patterns Added:
- ✅ Hardcoded dummy user data (3 patterns)
- ✅ Hardcoded dummy email
- ✅ Hardcoded dummy password (CRITICAL)
- ✅ Hardcoded dummy phone
- ✅ Lorem ipsum text
- ✅ Placeholder text
- ✅ Hardcoded dummy IDs
- ✅ Hardcoded dummy URLs
- ✅ Hardcoded dummy addresses
- ✅ Hardcoded dummy locations
- ✅ Hardcoded dummy dates
- ✅ Hardcoded dummy arrays
- ✅ Hardcoded dummy objects
- ✅ Hardcoded dummy API responses

### Guidance Added:
- ✅ All patterns have specific guidance messages
- ✅ Password pattern marked as CRITICAL

---

## 🚀 Usage

These patterns detect when an application contains hardcoded dummy/fake data, indicating:
- App is not live/production-ready
- App is a placeholder/demo
- App is fake/dummy
- Implementation is incomplete

---

**Status:** ✅ Complete  
**Last Updated:** 11-11-2025

