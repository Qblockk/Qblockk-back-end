# 🔐 QBLOCK AUTH API 

##  Novedades v1.1.0

### Campos Implementados:
- **`phone`**: Campo opcional para el número de teléfono del usuario (se puede agregar en el registro)
- **`last_log`**: Timestamp que se actualiza automáticamente cada vez que el usuario:
  - Inicia sesión (`/auth/login`)
  - Accede a cualquier endpoint protegido (con token Bearer)
  - Permite llevar un control de la última actividad del usuario

---

## 📋 Información General

**URL Base:** `http://localhost:3002`  
**Versión:** 1.2.0  
**Puerto:** 3002  
**Tecnologías:** Node.js + Express + TypeScript + Prisma + Supabase

---

## 🚀 Endpoints Disponibles

### 1️⃣ Health Check
**Verificar estado del servidor**

```bash
curl -X GET http://localhost:3002/health
```


---

### 2️⃣ Registro de Usuario
**Crear nueva cuenta de usuario**

```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlosherndes413@gmail.com",
    "password": "carlos123",
    "fullName": "Carlos Hernández",
    "phone": "+503 2395 1242"
  }'
```

**Campos requeridos:**
- `email` (string): Email único del usuario
- `password` (string): Contraseña (mínimo recomendado: 8 caracteres)
- `fullName` (string): Nombre completo del usuario

**Campos opcionales:**
- `phone` (string): Número de teléfono del usuario

**Posibles errores:**
- `400`: Email ya existe
- `400`: Campos faltantes o inválidos

---

### 3️⃣ Inicio de Sesión
**Autenticar usuario existente**

```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlosherndes413@gmail.com",
    "password": "carlos123"
  }'
```

**Campos requeridos:**
- `email` (string): Email del usuario
- `password` (string): Contraseña del usuario


**Información importante:**
- ✅ El campo `last_log` se actualiza automáticamente en cada login
- ✅ Los tokens tienen expiración: Access Token (15 min), Refresh Token (7 días)

**Posibles errores:**
- `401`: Credenciales incorrectas
- `400`: Campos faltantes

---

### 4️⃣ Ver Perfil (🔒 Protegido)
**Obtener información del usuario autenticado**

```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJjYXJsb3NoZXJuZGVzNDEzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU3NDMwODQwLCJleHAiOjE3NTc0MzE3NDB9.7WO1Pi2HajI_9nF7tbpTq0fGsi4k4UgFFdHJM0VN1pk"
```

**Headers requeridos:**
- `Authorization: Bearer {accessToken}`


**Información adicional:**
- 🔄 El campo `last_log` se actualiza automáticamente cada vez que se accede a cualquier endpoint protegido
- 📊 Muestra la última vez que el usuario interactuó con la API
- 🔒 Requiere token Bearer válido

**Posibles errores:**
- `401`: Token faltante o inválido
- `403`: Token expirado

---

### 5️⃣ Renovar Token
**Obtener nuevo access token usando refresh token**

```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidG9rZW5JZCI6Ijg5ZmM2MmQ0LTgxNGEtNGZkNi04ZDBjLWI4MTE1Y2Y5OTRmMCIsImlhdCI6MTc1NzQzMDg0MCwiZXhwIjoxNzU4MDM1NjQwfQ.pHzBK2pt62DH2m22SZtGVgIUFJDA3OP6j4tOy"
  }'
```

**Campos requeridos:**
- `refreshToken` (string): Refresh token obtenido en login/registro



**Posibles errores:**
- `401`: Refresh token inválido o expirado
- `403`: Usuario no encontrado

---

### 6️⃣ Cerrar Sesión (🔒 Protegido)
**Invalidar tokens del usuario**

```bash
curl -X POST http://localhost:3002/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJjYXJsb3NoZXJuZGVzNDEzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU3NDMwODQwLCJleHAiOjE3NTc0MzE3NDB9.7WO1Pi2HajI_9nF7tbpTq0fGsi4k4UgFFdHJM0VN1pk"
```

**Headers requeridos:**
- `Authorization: Bearer {accessToken}`

**Ejemplo de respuesta exitosa:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Posibles errores:**
- `401`: Token faltante o inválido
- `403`: Token expirado

---

## 🧪 Comandos para Pruebas de Validación

### ❌ Registro sin email
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "carlos123",
    "fullName": "Carlos Hernández"
  }'
```

### ❌ Registro sin fullName
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlosherndes413@gmail.com",
    "password": "carlos123"
  }'
```

### ❌ Login sin password
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlosherndes413@gmail.com"
  }'
```

### ❌ Profile sin token
```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Content-Type: application/json"
```

### ❌ Endpoint inexistente
```bash
curl -X GET http://localhost:3002/endpoint-inexistente
```

---

## 📊 Códigos de Estado HTTP

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| `200` | ✅ Operación exitosa | Login, profile, refresh exitosos |
| `201` | ✅ Usuario creado exitosamente | Registro completado |
| `400` | ❌ Datos inválidos o faltantes | Campos requeridos faltantes |
| `401` | ❌ No autorizado | Credenciales incorrectas, token faltante |
| `403` | ❌ Prohibido | Token expirado, permisos insuficientes |
| `404` | ❌ No encontrado | Endpoint no existe, usuario no encontrado |
| `409` | ❌ Conflicto | Email ya existe en registro |
| `500` | ❌ Error interno del servidor | Error de base de datos, error inesperado |


---

## 🛠️ Comandos de Instalación y Configuración

### **Instalación del Proyecto:**
```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm prisma generate

# Aplicar cambios a la base de datos
pnpm prisma db push

# Ejecutar en desarrollo
pnpm dev

# Ejecutar en producción
pnpm build && pnpm start
```

## 🔒 Notas de Seguridad

### **🔑 Tokens JWT:**
- **Access Token**: ⏰ 15 minutos de duración
- **Refresh Token**: ⏰ 7 días de duración
- **Producción**: ⚠️ Usa HTTPS siempre

### **🔐 Contraseñas:**
- **Hash**: bcrypt con salt rounds = 12
- **Respuesta**: Nunca se devuelven las contraseñas
- **Validación**: Implementa validaciones fuertes en el frontend

### **🌐 CORS:**
- **Desarrollo**: Configurado para `http://localhost:3000`
- **Producción**: Modifica `CORS_ORIGIN` según tu dominio

### **⚡ Rate Limiting:**
- **Recomendación**: Implementa limitación de requests
- **Herramienta**: Usa `express-rate-limit`

---

## 🔧 Troubleshooting

### **🚨 Errores Comunes:**

#### **Error: "socket hang up"**
```
✅ Solución:
- Verifica que la base de datos esté activa
- Confirma que la DATABASE_URL sea correcta
- Revisa la conectividad de red
```

#### **Error: "Token inválido"**
```
✅ Solución:
- Verifica que incluyas "Bearer " antes del token
- Confirma que el token no haya expirado
- Usa el refresh token para renovar
```

#### **Error: "Email ya existe"**
```
✅ Solución:
- El email debe ser único en el sistema
- Usa el endpoint de login en su lugar
- Verifica que no hayas registrado antes
```

#### **Error: "Cannot find module"**
```
✅ Solución:
- Ejecuta "pnpm install" para instalar dependencias
- Verifica que estés en el directorio correcto
- Regenera Prisma con "pnpm prisma generate"
```


#### **Error: "EADDRINUSE: address already in use"**
```
✅ Solución:
- Detén otros procesos en el puerto 3002
- Usa: "pkill -f '3002'" o cambia el puerto
- Verifica con: "lsof -i :3002"
```

---