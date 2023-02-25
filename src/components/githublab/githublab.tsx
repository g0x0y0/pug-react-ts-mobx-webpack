import React, { ChangeEvent, FC, MouseEvent } from 'react';
import { GithubLabClass } from './';

export const GithubLabComponent: FC<{ state: GithubLabClass }> = ({ state }) => {
	return (
		<div className="container">
			<h5>React form</h5>
			<form
				style={{ display: 'flex', flexDirection: 'column' }}
				onChange={(e: ChangeEvent<HTMLFormElement>) => state.handleChangeForm(e)}
			>
				<select name="selectField">
					{state.sortedArr.map((item) => (
						<option key={item} value={item}>
							{item}
						</option>
					))}
				</select>
				<input name="searchField" type="text" placeholder="search git repo" />
				<button name="buttonForm" onClick={(e: MouseEvent<HTMLElement>) => state.handleSubmit(e)} disabled={state.isLoading}>
					search
				</button>
			</form>
			<div style={{ display: 'flex', flexDirection: 'column', height: '50vh', overflow: 'auto', gap: '10px' }}>
				{state.isLoading ? (
					<>Loading...</>
				) : (
					state.data?.items?.map((item) => {
						return (
							<a key={item.id} style={{ display: 'flex', gap: 8 }} href={item.html_url} target="_blank">
								<img src={item.owner.avatar_url} alt="avatar" style={{ width: 60, height: 60 }} />
								<p>{item.description || item.name}</p>
							</a>
						);
					})
				)}
			</div>
			{state.page > 0 && (
				<div style={{ display: 'flex', fontSize: 32, gap: 8, alignItems: 'center', justifyContent: 'center' }}>
					<button style={{ fontSize: 32 }} disabled={state.isLoading || state.page === 1} onClick={() => state.handlePrevPage()}>
						{'<'}
					</button>
					<div>{state.page}</div>
					<button style={{ fontSize: 32 }} disabled={state.isLoading} onClick={() => state.handleNextPage()}>
						{'>'}
					</button>
				</div>
			)}
		</div>
	);
};
