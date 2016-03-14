/*var React = require('react');
var ReactDOM = require('react-dom');*/
var globalInfo = {
	files : null
}

var Notification = React.createClass({
	render : function(){
		return(
			<div className="text-lg-center">
			<strong>{this.props.strong}</strong> {this.props.message}
			</div>
		)
	}
});

var ButtonComparar = React.createClass({

	getInitialState : function(){
		return {texto : this.props.texto, disabled : false };
	},

	handleComparador : function(){
		ajax({
			method : 'POST',
			url : '/upload',
			data : globalInfo.files,
			isUploadFiles : true,
			beforeSend : function(xhr, data){
				this.setState({ texto : 'Comparando...', disabled : true});
			}.bind(this),
			onsuccess : function(data, xhr){
				data = JSON.parse(data);
				helper.removeClass(helper.getElement('#notification'), 'alert-success open');

				if(data.diff){
					ReactDOM.render(
						<Code code={JSON.stringify(data.originFile, null, 3)} type="Origen" name="Original.json" isDiffBlock="false"/>,
						helper.getElement('#origin')
					);

					ReactDOM.render(
						<Code code={JSON.stringify(data.traductionFile, null, 3)} type="Traduccion" name="traduccion.json" isDiffBlock="false"/>,
						helper.getElement('#compare')
					);

					ReactDOM.render(
						<CodeDiff code={JSON.stringify(data.diff, null, 3)} origin={JSON.stringify(data.originFile, null, 3)} traduction={JSON.stringify(data.traductionFile, null, 3)} textTraduction="Merge con Traducción" textOrigin="Merge con Origin" disabledOrigin="false" disabledTraduction="false" />,
						helper.getElement('#differences')
					);

					helper.addClass(helper.getElement('.code-place'), 'diff');
				}else{
					helper.removeClass(helper.getElement('#notification'));
					ReactDOM.render(
						<Notification strong="Perfecto" message="Ambos archivos tienen las mismas Claves"/>,
						helper.getElement('#notification')
					)
					helper.addClass(helper.getElement('#notification'), 'alert notification alert-info open');
				}

			},
		});
	},

	render : function(){
		return(
			 <div className="text-lg-center text-md-center">
			 	<button onClick={this.handleComparador} className={this.props.clases} disabled={this.state.disabled}> {this.state.texto} </button>
			 </div>
		)
	}
});

var Code = React.createClass({
	getInitialState : function(){
		return {isEditable : this.props.isEditable}
	},
	render: function(){
		return (
				<div>
					<h6><strong>{this.props.type}</strong> <span className="label label-pill label-primary">{this.props.name}</span> </h6>
					<pre contentEditable={this.state.isEditable} className="code-board">
						{this.props.code}
					</pre>
				</div>
		)
	}
});

var CodeDiff = React.createClass({
	getInitialState : function(){
		return {originFile : this.props.origin, traductionFile : this.props.traduction, textOrigin : this.props.textOrigin, textTraduction : this.props.textTraduction, disabledOrigin : this.props.disabledOrigin, disabledTraduction : this.props.disabledTraduction};
	},

	handleMerge : function(jsonFile){
		var btn = event.target.id;
		var valor = document.getElementById('fieldDiff').value;
		var diff = null;

		if (valor){
	    try{
	        diff = JSON.parse(valor);
	        json = JSON.parse(jsonFile);
	        var obj = makeMerge(json, diff);
	        obj = JSON.stringify(obj);
	        
	        ajax({
						method : 'POST',
						url : '/buildFile',
						data : "json="+obj,
						beforeSend : function(xhr, data){
							if(btn == 'buildTraduction'){
								this.setState({ textTraduction : 'Realizando Merge con Traducción...', disabledTraduction : true});
							}else{
								this.setState({ textOrigin : 'Realizando Merge con Origin...', disabledOrigin : true});
							}
						}.bind(this),
						onsuccess : function(data, xhr){
							data = JSON.parse(data);
						},
					});*/

	    }catch(e){
	        helper.addClass(helper.getElement('#notification'), 'alert-danger open');
			
					ReactDOM.render(
					<Notification strong="Algo va mal" message="Existe un error en el JSON del las diferencias, por favor verifique e intente de nuevo!"/>,
					helper.getElement('#notification')				
					);

					window.setTimeout(function(){
						helper.removeClass(helper.getElement('#notification'), 'alert-danger open');
					}, 3000);
	    }
		}
	},
	render: function(){
		return (
				<div className="differences">
					<div> <i className="fa fa-exchange"></i> Diferencias - <button onClick={this.handleMerge.bind(this, this.state.originFile)} className="btn btn-primary btn-sm" id="buildOrigin">{this.state.textOrigin}</button> <button onClick={this.handleMerge.bind(this, this.state.traductionFile, this.state.btn)} className="btn btn-warning btn-sm" id="buildTraduction">{this.state.textTraduction}</button></div>
					<textarea className="code-board" id="fieldDiff">
						{this.props.code}
					</textarea>
				</div>
		)
	}
});

var FieldInputZone = React.createClass({

	getInitialState : function(){
		return {files : null};
	},

	handleFile : function(event){
		var inputs = document.getElementsByClassName('files');
		var files = checkFiles(inputs);
		globalInfo.files = files;
		if(files){
			helper.addClass(helper.getElement("#notification"), 'alert-success open');
			ReactDOM.render(
				<ButtonComparar texto="Si, Comparar Archivos" clases="btn btn-primary btn-sm"/>,
				helper.getElement("#notification")
			);
		}
	},

	render : function(){
		return (
			<label id={this.props.labelID} className="dropzone">
				<input onChange={this.handleFile} type="file" name={this.props.name} id={this.props.id} className="hidden-xl-down files" data-target={this.props.target}/>
				<span>
					{this.props.texto}
					<article>
						<div id={this.props.target} className="path"></div>
						{this.state.files}
					</article>
				</span>
			</label>
		)
	}
});

ReactDOM.render(
	<FieldInputZone labelID="dropZoneOrLoadFileOrigin" texto="Por favor haz click para subir tu archivo de origen" name="origin" id="originFile" target="originPath"/>,
	document.getElementById('origin')
);

ReactDOM.render(
	<FieldInputZone labelID="dropZoneOrLoadFileTo" texto="Por favor haz click para subir tu archivo de traducción" name="traduccion" id="traductionFile" target="comparePath"/>,
	document.getElementById('compare')
);