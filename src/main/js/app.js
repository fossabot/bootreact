'use strict';

import { CreateDialog } from "./components/CreateDialog"
import { DataSetList } from "./components/DataSetList"

import WebFont from 'webfontloader';

//todo activate font
WebFont.load({
	google: {
		families: ['Titillium Web:300,400,700', 'sans-serif']
	}
});

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
		this.state = {dataSets: [], attributes: [], page: 1, pageSize: 4, links: {}};
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

	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
		stompClient.register([
			{route: '/topic/newDataSet', callback: this.refreshAndGoToLastPage},
			{route: '/topic/updateDataSet', callback: this.refreshCurrentPage},
			{route: '/topic/deleteDataSet', callback: this.refreshCurrentPage}
		]);
	}

	render() {
		return (
			<div className="container">
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
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)