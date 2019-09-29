'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client');

const follow = require('./follow'); // function to hop multiple links by "rel"

const stompClient = require('./websocket-listener');

const root = '/api';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {dataSets: [], attributes: [], page: 1, pageSize: 10, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
		this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [
				{rel: 'dataSets', params: {size: pageSize}}]
		).then(dataSetCollection => {
				return client({
					method: 'GET',
					path: dataSetCollection.entity._links.profile.href,
					headers: {'Accept': 'application/schema+json'}
				}).then(schema => {
					this.schema = schema.entity;
					this.links = dataSetCollection.entity._links;
					return dataSetCollection;
				});
		}).then(dataSetCollection => {
			this.page = dataSetCollection.entity.page;
			return dataSetCollection.entity._embedded.dataSets.map(dataSet =>
					client({
						method: 'GET',
						path: dataSet._links.self.href
					})
			);
		}).then(dataSetPromises => {
			return when.all(dataSetPromises);
		}).done(dataSets => {
			this.setState({
				page: this.page,
				dataSets: dataSets,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	// tag::on-create[]
	onCreate(newDataSet) {
		follow(client, root, ['dataSets']).done(response => {
			client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newDataSet,
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
	// end::on-create[]

	onUpdate(dataSet, updatedDataSet) {
		client({
			method: 'PUT',
			path: dataSet.entity._links.self.href,
			entity: updatedDataSet,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': dataSet.headers.Etag
			}
		}).done(response => {
			/* Let the websocket handler update the state */
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' + dataSet.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}

	onDelete(dataSet) {
		client({method: 'DELETE', path: dataSet.entity._links.self.href});
	}

	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(dataSetCollection => {
			this.links = dataSetCollection.entity._links;
			this.page = dataSetCollection.entity.page;

			return dataSetCollection.entity._embedded.dataSets.map(dataSet =>
					client({
						method: 'GET',
						path: dataSet._links.self.href
					})
			);
		}).then(dataSetPromises => {
			return when.all(dataSetPromises);
		}).done(dataSets => {
			this.setState({
				page: this.page,
				dataSets: dataSets,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

	// tag::websocket-handlers[]
	refreshAndGoToLastPage(message) {
		follow(client, root, [{
			rel: 'dataSets',
			params: {size: this.state.pageSize}
		}]).done(response => {
			if (response.entity._links.last !== undefined) {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		})
	}

	refreshCurrentPage(message) {
		follow(client, root, [{
			rel: 'dataSets',
			params: {
				size: this.state.pageSize,
				page: this.state.page.number
			}
		}]).then(dataSetCollection => {
			this.links = dataSetCollection.entity._links;
			this.page = dataSetCollection.entity.page;

			return dataSetCollection.entity._embedded.dataSets.map(dataSet => {
				return client({
					method: 'GET',
					path: dataSet._links.self.href
				})
			});
		}).then(dataSetPromises => {
			return when.all(dataSetPromises);
		}).then(dataSets => {
			this.setState({
				page: this.page,
				dataSets: dataSets,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}
	// end::websocket-handlers[]

	// tag::register-handlers[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
		stompClient.register([
			{route: '/topic/newDataSet', callback: this.refreshAndGoToLastPage},
			{route: '/topic/updateDataSet', callback: this.refreshCurrentPage},
			{route: '/topic/deleteDataSet', callback: this.refreshCurrentPage}
		]);
	}
	// end::register-handlers[]

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
				<DataSetList page={this.state.page}
							  dataSets={this.state.dataSets}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  attributes={this.state.attributes}
							  onNavigate={this.onNavigate}
							  onUpdate={this.onUpdate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newDataSet = {};
		this.props.attributes.forEach(attribute => {
			newDataSet[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newDataSet);
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
		});
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field"/>
			</p>
		);
		return (
			<div>
				<a href="#createDataSet">Create</a>

				<div id="createDataSet" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new dataSet</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
							<button onClick={this.addProperty}>Add property</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

class DetailsDialog extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const details = this.props.attributes.map(attribute =>
				<p>{this.props.dataSet.entity[attribute]}</p>
		);

		const dialogId = "detailsDataSet-" + this.props.dataSet.entity._links.self.href;

		return (
			<div>
				<a href={"#" + dialogId}>Details</a>

				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Details of the dataSet</h2>

						{details}
					</div>
				</div>
			</div>
		)
	}
}

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedDataSet = {};
		this.props.attributes.forEach(attribute => {
			updatedDataSet[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.dataSet, updatedDataSet);
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={this.props.dataSet.entity[attribute]}>
				<input type="text" placeholder={attribute}
					   defaultValue={this.props.dataSet.entity[attribute]}
					   ref={attribute} className="field"/>
			</p>
		);

		const dialogId = "updateDataSet-" + this.props.dataSet.entity._links.self.href;

		return (
			<div>
				<a href={"#" + dialogId}>Update</a>

				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update a dataSet</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

class DataSetList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

	render() {
		const pageInfo = this.props.page.hasOwnProperty("number") ?
			<h3>dataSets - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

		const dataSets = this.props.dataSets.map(dataSet =>
			<DataSet key={dataSet.entity._links.self.href}
					  dataSet={dataSet}
					  attributes={this.props.attributes}
					  onUpdate={this.props.onUpdate}
					  onDelete={this.props.onDelete}/>
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}

		return (
			<div>
				{pageInfo}
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<table>
					<tbody>
						<tr>
							<th>Name</th>
							<th>Age</th>
							<th>Diagnosis</th>
							<th>Details</th>
							<th></th>
							<th></th>
						</tr>
						{dataSets}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class DataSet extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.dataSet);
	}

	render() {
		return (
			<tr>
				<td>{this.props.dataSet.entity.name}</td>
				<td>{this.props.dataSet.entity.age}</td>
				<td>{this.props.dataSet.entity.diagnosis}</td>
				<td>
					<DetailsDialog dataSet={this.props.dataSet}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<UpdateDialog dataSet={this.props.dataSet}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)
