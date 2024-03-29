import DataTable from 'react-data-table-component';
import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { ARSENIC_API_URL } from 'js/lib/const';
import { defaultThemes } from 'js/lib/themes';
import ReactiveButton from 'reactive-button';

const customStyles = {
	header: {
		style: {
			minHeight: '56px',
		},
	},
	headRow: {
		style: {
			borderTopStyle: 'solid',
			borderTopWidth: '1px',
			borderTopColor: defaultThemes.default.divider.default,
		},
	},
	headCells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
	cells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
};

class ContentTable extends React.Component {
	constructor(props) {
		super(props);

		this.group = props.data

		this.columns = [
			{
				name: 'URL',
				selector: row => row.Url,
				sortable: true,
				wrap: true,
				grow: 3,
			},
			{
				name: 'Redirect',
				selector: row => row.Redirect,
				sortable: true,
				omit: !this.group.group.startsWith("3"),
				wrap: true,
				grow: 3,
			},
			{
				name: 'Content Type',
				selector: row => row.ContentType,
				sortable: true
			},
			{
				name: 'Content Length',
				selector: row => row.ContentLength,
				sortable: true,
			},
		];
	}

	render() {
		return (
			<DataTable
				columns={this.columns}
				data={this.group.data}
				customStyles={customStyles}
				pagination 
			/>
		);
	}
}

const ExpandedGroupComponent = ({ data: group }) => <ContentTable data={group} />;

class HostContent extends React.Component {
	constructor(props) {
		super(props);

		this.columns = [
			{
				name: '',
				selector: row => row.group,
			},
			{
				name: 'Count',
				selector: row => row.count,
			}
		];

		this.host = props.host
		this.state = {
			pending: true,
			results: []
		}
		this.url = `${ARSENIC_API_URL}/host/content`
	}

	fetchResults() {
		$.post(this.url, JSON.stringify({
			host: this.host
		}), (data) => {
			let results = []
			for (const group of Object.keys(data)) {
				results.push({
					group: group,
					count: data[group].length,
					data: data[group]
				})
			}
			this.setState({pending: false, results: results})
		}).fail(() => {
			this.setState({pending: false, results: []})
			console.log("Error getting host content results")
		})
	}

	render() {
		if (this.state.pending) {
			this.fetchResults()
		}
		return (
			<DataTable
				columns={this.columns}
				data={this.state.results}
				expandableRows
				expandableRowsComponent={ExpandedGroupComponent}
				highlightOnHover
			/>
		);
	}
}

class ReviewButton extends React.Component {
	constructor(props) {
		super(props)

		this.host = props.host
		this.url = `${ARSENIC_API_URL}/host/review`
	}

	review() {
		$.post(this.url, JSON.stringify({
			host: this.host
		}), (data) => {
			console.log(data)
		}).fail(() => {
			console.log("Error reviewing host")
		})
	}

	render() {
		return (
			<ReactiveButton
				idleText="Review"
				onClick={() => {
					this.review()
				}}
			/>
		);
	}
}

const domContainer = document.querySelector('#host-content');
ReactDOM.render(<HostContent host={hostParams.name}/>, domContainer);

const container = document.querySelector('#review-btn')
ReactDOM.render(<ReviewButton host={hostParams.name}/>, container)
