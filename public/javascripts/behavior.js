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
		abort: function(){ 
			this.xhr.abort();
			this.onerror(this.xhr);
			throw "Time has expired waiting for a response"
		},
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
  	if(options.isJSON){
  		options.xhr.setRequestHeader('Content-Type', 'application/json');
  	}
  	options.xhr.send(options.data);
	var timerid = window.setTimeout(function(){ options.abort(); }, options.timeout);
}

function checkFiles(inputs){
	var files = [];
	var allowed = 'application/octet-stream';
	var l = inputs.length || 0;
	if(l){
		for(var i = 0; i < l; i++){
			if(inputs[i].files.length > 0){
				if(inputs[i].files[0].type == allowed || inputs[i].files[0].name.indexOf('.json') > -1){
					inputs[i].files[0]['id'] = inputs[i].id;
					var path = document.getElementById(inputs[i].getAttribute('data-target'));
					path.innerHTML = "Tu archivo seleccionado : "+inputs[i].files[0].name;
					path.style.display = "inline-block";
					files.push(inputs[i].files);
				}else{
					alert('Por favor verificar que el archivo sea un formato json');
					throw "Por favor verificar que el archivo sea un formato json";
				}
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