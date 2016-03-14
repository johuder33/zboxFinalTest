// declaramos nuestra funcion ajax que permitira subir nuesto
// archivo al servidor.

function uploadFile(files, url, method) {
			if(arguments.length < 3) return;
			// creamos el objecto ajax,
      var xhr = new XMLHttpRequest() || new activeXObject();
      // creamos el objecto formData para subir archivos mediante ajax
      var fd = new FormData();
      
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
              console.log(xhr.responseText);
              console.log(JSON.parse(xhr.responseText));
          }
      };
      // optenemos la cantidad de archivos a subir
      var archivos = files.length;
      // los recorremos para procesarlos y añadirlos a formData para poder subir archivos mediante ajax,
      // aunque existen otros fallbacks mediante un iframes oculto que realiza una peticion, sin embargo
      // considere mejor poder realizarlo mediante un ajax real.
      for(; archivos-- > 0;){
      	fd.append(files[archivos][0].id, files[archivos][0]);
      }

      // abrimos la peticion, pasandole el metodo, la url, y diciendole que es una paticion asincrona = true. sincrona = false
      xhr.open(method, uri, true);
      // enviamos la peticion con los archivos como parametros
      xhr.send(fd);
  }

window.onload = function() {
		var inputs = null;
		var files = null;

		/*document.getElementById('origin').addEventListener('change', function(e){
			inputs = document.getElementsByClassName('files');
			files = checkFiles(inputs);

			if(files){
				enableUpload();
			}
		}, false);

		document.getElementById('compare').addEventListener('change', function(e){
			inputs = document.getElementsByClassName('files');
			files = checkFiles(inputs);

			if(files){
				enableUpload();
			}
		}, false);*/

		function checkFiles(inputs){
			var files = [];
			var l = inputs.length || 0;
			if(l){
				for(; l-- > 0;){
					if(inputs[l].files.length > 0){
						inputs[l].files[0]['id'] = inputs[l].id;
						var path = document.querySelector(inputs[l].getAttribute('data-target'));
						path.innerHTML = "Tu archivo seleccionado : "+inputs[l].files[0].name;
						path.style.display = "inline-block";
						files.push(inputs[l].files);
					}else{
						continue;
					}
				}
			}

			if(files.length < 2) return false;
			return files;
		}

		function uploading(files, inputs){
			if(files && files.length > 1){
				var l = inputs.length;
				for(; l-- > 0 ;){
					inputs[l].disabled = "disabled";
				}
			}
		}

		function enableUpload(){
			//helper.getElement('#uploader');
			var html = "<div class='text-lg-center'> <button id='uploader' class='btn btn-primary btn-sm'>Comparar Archivos</button> </div>";
			_alert.createAlert('alert-success open', html);
		}

		/*addEventListener('click', function(e){
			var target = e.target || e.srcElement;
			if(target.id == 'uploader'){

				ajax({
					method : 'POST',
					url : '/upload',
					data : files,
					isUploadFiles : true,
					beforeSend : function(xhr, data){
						btn = helper.getElement('#uploader');
						btn.disabled = "disabled";
						btn.innerHTML = "Comparando...";
					},
					onsuccess : function(data, xhr){
						console.log(JSON.parse(data));
						console.log(xhr);
						_alert.removeAlert();
					},
				});

				//uploadFile(files, '/upload', 'POST');
			}
		}, true);*/
}

function ajax(options){
	if(helper.isType(options, 'Object') == -1 && !options) return;
	
	var fd = new FormData();

	defaults = {
		xhr : new XMLHttpRequest(),
		method : 'GET',
		url : '/',
		data : '',
		isJSON : false,
		async : true,
		timeout : 50000,
		isUploadFiles : false,
		onerror : function(xhr, data){},
		onsuccess : function(data, xhr){},
		oncomplete : function(data, xhr){},
		abort: function(){ xhr.abort(); },
		beforeSend : function(xhr){}
	};
	options = options || defaults;

	for(var key in defaults){
		if(options.hasOwnProperty(key)){
		}else{
			options[key] = defaults[key];
		}
	}

	options.beforeSend();

	if(options.isUploadFiles){
		if(helper.isType(options.data, 'Array')){
			var files = options.data.length;
	      // los recorremos para procesarlos y añadirlos a formData para poder subir archivos mediante ajax,
	      // aunque existen otros fallbacks mediante un iframes oculto que realiza una peticion, sin embargo
	      // considere mejor poder realizarlo mediante un ajax real.
	    for(; files-- > 0;){
	    	fd.append(options.data[files][0].id, options.data[files][0]);
	    }
		}
	}

	options.xhr.onreadystatechange = function() {
      if(options.xhr.readyState == 4 && options.xhr.status == 200) {
    		options.onsuccess(options.xhr.responseText, options.xhr);
    		window.clearTimeout(timerid);
      }

      if(options.xhr.readyState == 4){
      	options.oncomplete(options.xhr);
      	window.clearTimeout(timerid);
      }

      if(options.xhr.readyState == 4 && options.xhr.status == (500 || 404)){
      	options.onerror(options.xhr, options.xhr.responseText);
      	window.clearTimeout(timerid);
      }
  };

  // enviamos la peticion con los archivos como parametros
  if(options.isUploadFiles) options.data = fd;
  options.xhr.open(options.method, options.url, options.async);
  options.xhr.send(options.data);
	var timerid = window.setTimeout(function(){ options.abort(); }, options.timeout);
}

function checkFiles(inputs){
	var files = [];
	var l = inputs.length || 0;
	if(l){
		for(var i = 0; i < l; i++){
			if(inputs[i].files.length > 0){
				inputs[i].files[0]['id'] = inputs[i].id;
				var path = document.getElementById(inputs[i].getAttribute('data-target'));
				path.innerHTML = "Tu archivo seleccionado : "+inputs[i].files[0].name;
				path.style.display = "inline-block";
				files.push(inputs[i].files);
			}else{
				continue;
			}
		}
	}

	if(files.length < 2) return false;
	return files;
}

function makeMerge(file, diff){
	// recorremos ambos archivos, y ademas se crea una variable p que inicia en 0.
	// esto para que primera recorramos el ultimo archivo osea de traduccion, y busquemos si las claves de este archivo
	// son las mismas que las claves de origin, por ende la logica esta en que recorramos el nro de archivos de atras hacia adelante
	// para que los puntos se intercambies dinamicamente y asi recorrer chequear ambos archivo a la vez, cuando haya differencias
	// se agrega al objecto diff que creamos al principio.
	for(var key in diff){
		if(!file.hasOwnProperty(key)){
			file[key] = diff[key];
		}
	}

	// si no hubo diferencias retornamos falso
	if(Object.keys(file).length === 0 && JSON.stringify(file) === JSON.stringify(file)) return false;
	// si hubo diferencias retornamos las diferencias.
	return file;
}

var json = {
   "nombre": "Johuder",
   "apellidos": "Gonzalez",
   "edad": 24,
   "pais": "Venezuela",
   "ciudad": "caracas",
   "Apodo": "Yode",
   "profesion": "Programador"
}

var diff = {
   "ciudad": "caracas",
   "ciudsad": "Santiago"
}

console.log(makeMerge(json, diff));

var helper = (function(){
	return {
		addClass : function(element, _class){
			if(arguments.length < 2) return;

			if(this.isRealElement(element)){
				element.className += ' '+_class;
			}
		},

		getElement : function(_class_id){
			if(arguments.length < 1) return;
			return document.querySelector(_class_id);
		},

		removeClass : function(element, _class){
			if(!this.isRealElement(element)) return;
			if(arguments[1] === undefined){
				element.className = '';
			}else{
				if(element.className.match(new RegExp('(\\s|^)'+_class+'(\\s|$)', 'g'))){
					element.className = element.className.replace(new RegExp('(\\s|^)'+_class+'(\\s|$)', 'g'), '');
				}
			}
		},

		isRealElement : function(element){
			try{
				if(element.tagName.length > 0){
					return true;
				}
			}catch(e){
				return false;
			}
		},

		isType : function(target, type){
			if(arguments.length < 2) return;
			return target.constructor.toString().indexOf(type);
		}
	}
})();

var _alert = (function(){
	var isAlerted = false;
	var classAlert = null;
	var html = null;
	var maxLife = 0;
	var parent = document.getElementById('notification');

	return {
		createAlert : function(_class, html, maxLife){
			parent.innerHTML = html;
			helper.addClass(parent, _class);
			if(maxLife){
				setTimeout(function(){
					helper.removeClass(parent, _class);
					isAlerted = false;
					classAlert = null;
				}, maxLife);
			}

			isAlerted = true;
			classAlert = _class;
		},

		changeParent : function(element){
			if(arguments.length < 1) return;
			if(element.length > 0){
				parent = element;
			}else{
				throw new Error('Error : Debe indicar un elemento HTML, para cambiar el contenedor de la alerta.')
			}
		},

		removeAlert : function(){
			if(isAlerted && typeof classAlert == 'string'){
				helper.removeClass(parent, classAlert);
				isAlerted = false;
				classAlert = null;
			}
		}
	}

})();

var replacer = function(match, pIndent, pKey, pVal, pEnd) {
  var key = '<span class=json-key>';
  var val = '<span class=json-value>';
  var str = '<span class=json-string>';
  var r = pIndent || '';
  if (pKey)
     r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
  if (pVal)
     r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
  return r + (pEnd || '');
};

var prettyJSON = function(obj) {
  var lineofJSON = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
  return JSON.stringify(obj, null, 3)
  .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(lineofJSON, replacer);
}