import React, { ChangeEvent, FC, MouseEvent, MouseEventHandler, ReactElement } from 'react';
import { GithubLabComponent } from './githublab';
import { observer } from 'mobx-react';
import { action, makeAutoObservable, observable, reaction, runInAction } from 'mobx';
import { Api } from '@utils/api';
import { IResponseData } from '@types';

export class GithubLabClass {
	/** апи по обработке запросов к серверу */
	private api = new Api();
	/** значение номера страницы */
	@observable page: number = 0;
	/** данные с полями формы */
	@observable form: FormData = new FormData();
	/** данные с сервера */
	@observable data: IResponseData = undefined;
	/** признак загрузки */
	@observable isLoading: boolean = false;

	sortedArr = ['created', 'updated', 'pushed', 'full_name'];

	constructor() {
		makeAutoObservable(this);
		reaction(
			() => this.data,
			() => {
				this.isLoading = false;
				if (this.data.total_count > 30) {
					this.page = this.page || 1;
				} else {
					this.page = 0;
				}
			}
		);

		reaction(
			() => this.page,
			(value, prev) => {
				value >= 1 && prev !== 0 && this.handleSubmit();
			}
		);
	}

	@action.bound async handleSubmit(e?: MouseEvent<HTMLElement>) {
		e && e.preventDefault();
		const searchText = this.form.get('searchField');
		const sort = this.form.get('selectField');
		if (searchText && searchText.length) {
			this.isLoading = true;
			this.api.setUrl(`/githublab/search/repositories?q=${searchText}&sort=${sort}&page=${this.page}`);
			const data = await this.api.getData();
			runInAction(() => {
				this.data = data;
			});
		}
	}

	@action handleChangeForm(e: ChangeEvent<HTMLFormElement>) {
		this.form = new FormData(e.currentTarget);
	}

	@action handleNextPage() {
		this.page++;
	}

	@action handlePrevPage() {
		this.page--;
	}
}

export default () => React.createElement(observer(GithubLabComponent), { state: new GithubLabClass() });
