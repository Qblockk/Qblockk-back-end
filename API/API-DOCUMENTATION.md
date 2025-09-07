# 🔐 QBLOCK AUTH API 

## 📋 Información General

**URL Base:** `http://localhost:3002`  
**Versión:** 1.0.0  
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
    "email": "usuario@test.com",
    "password": "password123",
    "fullName": "Usuario de Prueba"
  }'
```

**Campos requeridos:**
- `email` (string): Email único del usuario
- `password` (string): Contraseña (mínimo recomendado: 8 caracteres)
- `fullName` (string): Nombre completo del usuario


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
    "email": "usuario@test.com",
    "password": "password123"
  }'
```

**Campos requeridos:**
- `email` (string): Email del usuario
- `password` (string): Contraseña del usuario



**Posibles errores:**
- `401`: Credenciales incorrectas
- `400`: Campos faltantes

---

### 4️⃣ Ver Perfil (🔒 Protegido)
**Obtener información del usuario autenticado**

```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

**Headers requeridos:**
- `Authorization: Bearer {accessToken}`



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
    "refreshToken": "TU_REFRESH_TOKEN_AQUI"
  }'
```

**Campos requeridos:**
- `refreshToken` (string): Refresh token obtenido en login/registro



**Posibles errores:**
- `401`: Refresh token inválido o expirado

---

### 6️⃣ Cerrar Sesión (🔒 Protegido)
**Invalidar tokens del usuario**

```bash
curl -X POST http://localhost:3002/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN_AQUI"
  }'
```

**Headers requeridos:**
- `Authorization: Bearer {accessToken}`

**Campos requeridos:**
- `refreshToken` (string): Refresh token a invalidar



---

##  Comandos para Pruebas de Validación

###  Registro sin email
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "fullName": "Test User"
  }'
```

###  Registro sin fullName
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
```

###  Login sin password
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com"
  }'
```

###  Profile sin token
```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Content-Type: application/json"
```

###  Endpoint inexistente
```bash
curl -X GET http://localhost:3002/endpoint-inexistente
```

---

##  Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | ✅ Operación exitosa |
| `201` | ✅ Usuario creado exitosamente |
| `400` | ❌ Datos inválidos o faltantes |
| `401` | ❌ No autorizado (credenciales incorrectas) |
| `403` | ❌ Token expirado o usuario no encontrado |
| `404` | ❌ Endpoint no encontrado |
| `409` | ❌ Email ya existe (en registro) |
| `500` | ❌ Error interno del servidor |

---

##  Configuración de Headers

### Para todos los endpoints:
```
Content-Type: application/json
```

### Para endpoints protegidos (Profile, Logout):
```
Content-Type: application/json
Authorization: Bearer {tu_access_token}
```

---

##  Flujo de Autenticación Recomendado

### 1. **Registro/Login**
```bash
# Registro (si es nuevo usuario)
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "pass123", "fullName": "User Test"}'

# O Login (si ya existe)
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "pass123"}'
```

### 2. **Guardar tokens**
```javascript
// Del response anterior, guarda:
const accessToken = response.data.tokens.accessToken;   // Expira en 15 min
const refreshToken = response.data.tokens.refreshToken; // Expira en 7 días
```

### 3. **Usar endpoints protegidos**
```bash
# Ejemplo: ver perfil
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer ${accessToken}"
```

### 4. **Renovar token cuando expire**
```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"${refreshToken}\"}"
```

### 5. **Logout al finalizar**
```bash
curl -X POST http://localhost:3002/auth/logout \
  -H "Authorization: Bearer ${accessToken}" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"${refreshToken}\"}"
```

---


### Comandos de instalación
```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm prisma generate

# Ejecutar en desarrollo
pnpm dev

# Ejecutar en producción
pnpm build && pnpm start
```

---

## Notas de Seguridad

1. **Tokens JWT:**
   - Access Token: 15 minutos de duración
   - Refresh Token: 7 días de duración
   - Usa HTTPS en producción

2. **Contraseñas:**
   - Hasheadas con bcrypt
   - Nunca se devuelven en las respuestas

3. **CORS:**
   - Configurado para `http://localhost:3000` por defecto
   - Modifica `CORS_ORIGIN` según tu frontend

4. **Rate Limiting:**
   - Implementa limitación de requests en producción
   - Considera usar middleware como `express-rate-limit`

---

##  Troubleshooting

### Error: "socket hang up"
- Verifica que la base de datos esté activa
- Confirma que la `DATABASE_URL` sea correcta

### Error: "Token inválido"
- Verifica que incluyas `Bearer ` antes del token
- Confirma que el token no haya expirado

### Error: "Email ya existe"
- El email debe ser único en el sistema
- Usa el endpoint de login en su lugar

### Error: "Cannot find module"
- Ejecuta `pnpm install` para instalar dependencias
- Verifica que estés en el directorio correcto

