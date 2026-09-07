# Simulador de Hardware Analógico Suanpan 2/5 (Álgebra Matricial)

Simulador interactivo de hardware analógico basado en el ábaco tradicional chino **Suanpan** (formato 2/5) para la resolución didáctica paso a paso de sistemas de ecuaciones lineales 2x2 y 3x3 mediante el método histórico **Fangcheng** (方程) y eliminación de Gauss analógica.

---

## 🚀 Despliegue en GitHub Pages

El proyecto está preparado para desplegarse fácilmente en **GitHub Pages** mediante GitHub Actions.

### Configuración paso a paso en GitHub:

1. Sube este proyecto a tu repositorio en GitHub (`main` o `master`).
2. En GitHub, entra en tu repositorio y ve a **Settings** > **Pages** (en la barra lateral izquierda).
3. En la sección **Build and deployment**:
   - En **Source**, selecciona: **GitHub Actions**.
4. GitHub detectará automáticamente el archivo `.github/workflows/deploy.yml` y desplegará la web en pocos minutos en la dirección:  
   `https://<tu-usuario>.github.io/<tu-repositorio>/`

---

## 🛠️ Instalación y Uso Local

Si prefieres ejecutarlo o probarlo localmente en tu máquina:

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
cd <tu-repositorio>

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev

# 4. Compilar para producción
npm run build

# 5. Previsualizar la compilación de producción localmente
npm run preview
```

---

## 算 Reglas del Hardware Analógico Suanpan 2/5

1. **Filas de Memoria:** Cada fila física del ábaco almacena una ecuación completa del sistema.
2. **Bloques Lógicos:** Cada fila se divide en bloques independientes para cada incógnita (`X`, `Y`, `Z`) y el `Resultado (R)`.
3. **4 Alambres Fijos por Bloque [S, C, D, U]:**
   - **S (Signo):** `0 = Positivo` (cuenta abajo), `1 = Negativo` (cuenta arriba pegada a la viga central).
   - **C (Centenas):** Valor decimal posicional $\times 100$.
   - **D (Decenas):** Valor decimal posicional $\times 10$.
   - **U (Unidades):** Valor decimal posicional $\times 1$.
4. **Formato 2/5 y Capacidad de Sobrecarga (15 Cuentas):**
   - **Cielo (天):** 2 cuentas superiores (cada una vale 5 al bajarse hacia la viga).
   - **Tierra (地):** 5 cuentas inferiores (cada una vale 1 al subirse hacia la viga).
   - **Holgura de 15 cuentas:** Cada alambre puede albergar temporalmente hasta 15 unidades durante multiplicaciones intermedias sin acarrear de inmediato, emulando la velocidad de cálculo del método histórico chino antes de simplificar a base 10 canónica.
