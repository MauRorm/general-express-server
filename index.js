const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 8000
const fs = require('fs');
const app = express();
const path = require('path');
var compression = require('compression');
app.use(compression());
const helmet = require('helmet');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "object-src": ["'none'"]
    }
  })
);

app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'public', req.path); // Ajusta la carpeta 'public' según sea necesario

  fs.exists(filePath, (exists) => {
      if (exists) {
          // Determinar el Content-Type basado en la extensión del archivo
          const ext = path.extname(req.path);
          if (ext === '.css') {
              res.setHeader('Content-Type', 'text/css');
          } else if (ext === '.js') {
              res.setHeader('Content-Type', 'application/javascript');
          }
          
          // Servir el archivo
          fs.createReadStream(filePath).pipe(res);
      } else {
          next(); // Continuar con el siguiente middleware si el archivo no existe
      }
  });
});

app.use(cors({ credentials: true, origin: `http://localhost:3000` }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(require('./api/routes/crud'));


// Sirve archivos estáticos primero
app.use(express.static(path.join(__dirname, './client/build')));

// Luego, maneja cualquier otra ruta con index.html
app.get('*', (req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, './client/build', 'index.html'));
});




app.listen(port, () => console.log(`Servidor iniciado en el puerto ${port} ${process.env.BASE_URL}`))


