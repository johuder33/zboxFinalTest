// incluimos nuestra librerias necesarias
var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');

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
	var counter = 0;
	var objFile = {};
	var key = [];

	files.forEach(function(item){
		fs.readFile(item.path, 'utf8', function(err, data){
			if(!err){
				objFile[item.fieldname] = JSON.parse(data);
				key.push(item.fieldname);
				console.log(key, item.fieldname);
				counter += 1;
				if(counter === files.length){
					var diff = getDiff(objFile[key[0]], objFile[key[1]]);
					if(diff){
						objFile['diff'] = diff;
					}
					res.send(objFile);
				}
			}else{
				console.log("Error :", err);
			}
		});
	});

}

/*function readFile(path, res){
	fs.readFile(path, 'utf8', function(err, data){
		if(err){
			console.log(err);
		}else{
			console.log("Aqui esta tu contenido");
			console.log(JSON.parse(data));
			res.render('leer', {content: JSON.parse(data), title : "Contenido del archivo"});
		}
	});
}

function writeFile(fileName, content){
	fs.writeFile('./'+fileName, content, function(err){
		if(err){
			console.log('Lo siento pero hubo un error al crear tu archivo', err);
		}else{
			console.log('Hemos creado tu archivo con exito');
		}
	});
}*/

router.get('/', function(req, res, next){
	res.render('index', {title : 'Mi titulo'});
});

router.post('/upload', upload.any(), function(req, res, next){
	console.log(req.files);
	leerArchivos(req.files, res);
	//res.send("Hemos recibido tu petición");
});

router.post('/buildFile', function(req, res, next){
	console.log(req.body);
	//res.send("Hemos recibido tu petición");
});

module.exports = router;