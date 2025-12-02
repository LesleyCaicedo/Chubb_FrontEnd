# 📱 Proyecto Angular

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (versión 18 o superior recomendada)
  - Puedes descargarlo desde: https://nodejs.org/
  - Para verificar si ya lo tienes instalado, ejecuta: `node --version`
- **npm** (se instala automáticamente con Node.js)
  - Para verificar la versión: `npm --version`
- **Angular CLI** (opcional pero recomendado)
  - Para instalarlo globalmente: `npm install -g @angular/cli`
- **Visual Studio Code** (recomendado)
  - Descárgalo desde: https://code.visualstudio.com/

## 🚀 Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:

### 1️⃣ Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]
```

### 2️⃣ Abrir con Visual Studio Code

```bash
code .
```

O simplemente abre Visual Studio Code y selecciona **File → Open Folder** y elige la carpeta del proyecto.

### 3️⃣ Abrir la Terminal

Dentro de Visual Studio Code:
- Presiona **Ctrl + `** (acento grave) o
- Ve a **Terminal → New Terminal** en el menú superior

### 4️⃣ Instalar Dependencias

Ejecuta el siguiente comando en la terminal:

```bash
npm install --force
```

> **Nota:** El flag `--force` se utiliza para resolver posibles conflictos de dependencias. Espera a que se complete la instalación.

### 5️⃣ Iniciar el Servidor de Desarrollo

Una vez instaladas todas las librerías, ejecuta:

```bash
ng serve
```

O también puedes usar:

```bash
npm start
```

El proyecto se compilará y estará disponible en: **http://localhost:4200/**

## 🌐 Acceder a la Aplicación

Abre tu navegador web y navega a:

```
http://localhost:4200/
```

La aplicación se recargará automáticamente si realizas cambios en los archivos del proyecto.