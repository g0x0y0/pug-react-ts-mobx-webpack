import { Api } from '@utils/api';
import { IResponseData } from '@types';
import { action, makeAutoObservable, observable, reaction, runInAction } from 'mobx';

class Form {
	/** апи по обработке запросов к серверу */
	private api = new Api();
	/** значение номера страницы */
	@observable page: number = 0;
	/** селектор контейнера формы */
	@observable container: HTMLElement;
	/** данные с полями формы */
	@observable form: FormData = new FormData();
	/** селектор с полем контента */
	@observable contentField: HTMLDivElement;
	/** данные с сервера */
	@observable data: IResponseData = undefined;
	/** признак загрузки */
	@observable isLoading: boolean = false;

	constructor(container: HTMLElement) {
		makeAutoObservable(this);
		this.container = container;
		this.contentField = container.querySelector('.content__field');
		this._setListeners(container);
		/** реакция на изменение данных при запросе поиска репозиториев */
		reaction(
			() => this.data,
			(value) => {
				if (value) {
					this.contentField.textContent = '';
					this.isLoading = false;
					this.data.items.forEach((item) => {
						const desc = document.createElement('a');
						desc.className = 'content__desc';
						desc.setAttribute('target', '_blank');
						desc.href = item.html_url;
						const p = document.createElement('p');
						const img = document.createElement('img');
						img.src = item.owner.avatar_url;
						img.classList.add('content__desc_image');
						p.textContent = item.description || item.name;
						[img, p].forEach((tag) => desc.appendChild(tag));
						this.contentField.append(desc);
					});
					if (this.data.total_count > 30) {
						this.page = this.page || 1;
					} else {
						this.page = 0;
					}
				}
			}
		);
		/** реакция на изменение признака загрузки приложения */
		reaction(
			() => this.isLoading,
			(value) => {
				if (value) {
					this.contentField.textContent = 'Loading...';
					this.container.querySelector('.form-button').setAttribute('disabled', '');
					this.container.querySelector('.pagination-back').setAttribute('disabled', '');
					this.container.querySelector('.pagination-forward').setAttribute('disabled', '');
				} else {
					this.container.querySelector('.pagination-back').removeAttribute('disabled');
					this.container.querySelector('.pagination-forward').removeAttribute('disabled');
					this.container.querySelector('.form-button').removeAttribute('disabled');
				}
			}
		);
		/** реакция на изменение значения номера страницы */
		reaction(
			() => this.page,
			(value, prev) => {
				if (value > 0) {
					this.container.querySelector<HTMLDivElement>('.pagination').style.display = 'flex';
					this.container.querySelector<HTMLDivElement>('.current-page').textContent = this.page.toString();
					if (value === 1) {
						this.container.querySelector('.pagination-back').setAttribute('disabled', '');
					} else {
						this.container.querySelector('.pagination-back').removeAttribute('disabled');
					}
				} else {
					this.container.querySelector<HTMLDivElement>('.pagination').style.display = 'none';
				}
				if (value >= 1 && prev !== 0) {
					this.handleSubmit();
				}
			}
		);
	}

	/** установить слушателей элементов контейнера формы
	 * @container - элемент контейнера формы
	 */
	_setListeners = (container: HTMLElement) => {
		const form: HTMLFormElement = container.querySelector('.form');
		if (!this.form) {
			this.form = new FormData(form);
		}
		form.addEventListener('change', () => {
			runInAction(() => {
				this.form = new FormData(form);
			});
		});
		this.container.querySelector('.pagination-back').addEventListener('click', () => {
			runInAction(() => {
				this.page -= 1;
			});
		});
		this.container.querySelector('.pagination-forward').addEventListener('click', () => {
			runInAction(() => {
				this.page += 1;
			});
		});
		form.onsubmit = this.handleSubmit;
	};

	/**
	 * обработчик подтверждения выполнение запроса по поиску гит репозиториев
	 * @param e - данные события при подтверждении поиска
	 */
	@action handleSubmit = async (e?: SubmitEvent) => {
		e?.preventDefault();
		const searchText = this.form.get('searchField');
		const sort = this.form.get('selectField');
		if (searchText && searchText.length) {
			this.isLoading = true;
			this.api.setUrl(`/githublab/search/repositories?q=${searchText}&sort=${sort}&page=${this.page}`);
			const data = await this.api.getData();
			runInAction(() => {
				this.data = data;
			});
		} else {
			this.contentField.textContent = 'Fill in the search field';
		}
	};
}

const formContainers: NodeListOf<HTMLDivElement> = document.querySelectorAll('.form__container');
formContainers.forEach((container) => new Form(container));
