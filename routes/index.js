// incluimos nuestra librerias necesarias
var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');

function Timer(){
};

Timer.prototype.time = function(){
	this._time = new Date().getTime();
}

Timer.prototype.timeEnd = function(formato){
	var time = this._time;
	return ((new Date().getTime() - this._time) / 1000) + formato;
}

var timer = new Timer();

// con multer, podemos renombrar nuestros archivos y ademas escoger a donde debemos guardarlo
var storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
  	}
});

// pasamos como parametro la funcion que gestiona nuestros archivos
var upload = multer({ storage : storage });

// creamos la funcion que buscara y leera nuestros archivos subidos
function getDiff(origin, traduccion){
	// creamos el objeto donde almacenaremos las diferencias
	var diff = {};
	// obtenemos el tamaño de los argumentos para recorrerlos.
	var l = arguments.length;

	// recorremos ambos archivos, y ademas se crea una variable p que inicia en 0.
	// esto para que primera recorramos el ultimo archivo osea de traduccion, y busquemos si las claves de este archivo
	// son las mismas que las claves de origin, por ende la logica esta en que recorramos el nro de archivos de atras hacia adelante
	// para que los puntos se intercambies dinamicamente y asi recorrer chequear ambos archivo a la vez, cuando haya differencias
	// se agrega al objecto diff que creamos al principio.
	for(var p = 0; l-- > 0; p++){
		for(var key in arguments[l]){
			if(!arguments[p].hasOwnProperty(key)){
				diff[key] = arguments[l][key];
			}
		}
	}

	// si no hubo diferencias retornamos falso
	if(Object.keys(diff).length === 0 && JSON.stringify(diff) === JSON.stringify(diff)) return false;
	// si hubo diferencias retornamos las diferencias.
	return diff;
}

function leerArchivos(files, res){
	timer.time();
	// contador para determinar cuando termino el each
	var counter = 0;
	// objeto que vamos a retornar
	var objFile = {};
	// las claves para obtener de mejor manera los archivos
	var key = [];

	// recorremos ambos archivos
	files.forEach(function(item){
		// leemos archivo actual, con readFile nodejs
		fs.readFile(item.path, 'utf8', function(err, data){
			// cuando ha leido bien el archivo
			if(!err){
				// guardamos el archivo al objeto de retorno y lo convertimos en objeto con JSON.parse
				objFile[item.fieldname] = JSON.parse(data);
				// guardamos nuestra clave
				key.push(item.fieldname);
				// incrementamos contador
				counter += 1;
				// si el contador es igual a la cantidad de archivos a recorrer terminamos.
				if(counter === files.length){
					// buscamos las diferencias entre ambos archivos
					var diff = getDiff(objFile[key[0]], objFile[key[1]]);
					var msg = 'Ambos archivos son iguales, no hay diferencias';
					// si existe diferencias
					if(diff){
						// agregamos las diferencia en el objeto a retornar
						objFile['diff'] = diff;
						msg = 'Existen diferencias, el proceso ha tardado ';
					}
					// enviamos la respuesta.
					var total = timer.timeEnd('s');
					res.status(200).send({files : objFile, time : total, msg : msg});
				}
			}else{
				// si hubo algo mal, enviamos error.
				res.status(500).send('Ocurrio un error, por favor intentelo de nuevo');
			}
		});
	});
}

function writeFileForDownloading(fileName, content, res){
	timer.time();
	// creamos un prefijo del nombre del archivo para evitar sobrescritura de archivos.
	var prefixName = new Date().getTime()+'_';
	// guardamos el nombre nuevo del archivo en una variable
	var _filename = prefixName+fileName;
	// guardamos la ruta donde crearemos le archivo
	var path = './public/jsonDownloads/'+_filename;
	// y creamos la ruta para el front end donde podran descargar los archivos
	var downloadPath = '/jsonDownloads/'+_filename;
	// llamamos a writeFile de nodejs para escribir archivos
	fs.writeFile(path, content, function(err){
		// si hay error
		if(err){
			// respondemos con error
			res.status(500).send('Ocurrio un error, por favor intente nuevamente.');
		}else{
			var total = timer.timeEnd('s');
			// si todo es ok, enviamos la respuestas con un mensaje de respuesta, la ruta y nombre del archivo para manejarlo en el front end
			res.status(200).send({msg : 'Tu archivo se ha creado con éxito y esta listo para descargarlo. ', url : downloadPath, filename : _filename, time : total});
		}
	});
}

// nuestro router para el index de nuestra app
router.get('/', function(req, res, next){
	res.render('index', {title : 'Comparador JSON 2 JSON'});
});

// nuestro router para subir los archivos del cliente al server
router.post('/upload', upload.any(), function(req, res, next){
	leerArchivos(req.files, res);
});

// nuestro router para construir nuestro merge y retornarlo si todo esta OK
router.post('/buildFile', function(req, res, next){
	var content = JSON.stringify(req.body, null, 3);
	writeFileForDownloading('merge.json', content, res);
});

module.exports = router;