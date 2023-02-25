import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration as WebpackConfig, DefinePlugin } from 'webpack';
import { Configuration as ServerConfig } from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
//@ts-ignore
import PugPlugin from 'pug-plugin';

export type TConfiguration = WebpackConfig & ServerConfig;

const config = (env: any, cfg: any): TConfiguration => {
	const isProd = cfg.mode === 'production';

	return {
		mode: isProd ? 'production' : 'development',
		devtool: isProd ? 'source-map' : 'inline-source-map',
		cache: false,
		stats: 'minimal',

		entry: {
			index: path.resolve(__dirname, 'src/index.pug'),
		},

		output: {
			path: path.resolve(__dirname, 'build'),
			publicPath: 'auto',
			filename: 'assets/js/[name].[contenthash:8].js',
			clean: true,
		},

		resolve: {
			extensions: ['.ts', '.js', '.json', '.tsx'],
			plugins: [new TsconfigPathsPlugin({ extensions: ['.ts', '.js', '.json', '.tsx'] })],
			alias: {
				'@core': path.join(__dirname, 'src/core/'),
				'@views': path.join(__dirname, 'src/views/'),
				'@utils': path.join(__dirname, 'src/utils/'),
				'@types': path.join(__dirname, 'src/types/'),
				'@components': path.join(__dirname, 'src/components/'),
			},
		},

		module: {
			rules: [
				{
					test: /\.(ts|tsx)?$/,
					exclude: /node_modules/,
					use: 'ts-loader',
				},
				{
					test: /\.(pug)$/,
					loader: PugPlugin.loader,
					options: {
						// enable filters only those used in pug
						embedFilters: {
							// :escape
							escape: true,
							// :code
							code: {
								className: 'language-',
							},
							// :highlight
							highlight: {
								verbose: !isProd,
								use: 'prismjs', // name of a highlighting npm package, must be extra installed
							},
						},
					},
				},
				{
					test: /\.(css|sass|scss)$/,
					use: ['css-loader', 'sass-loader'],
				},
			],
		},
		plugins: [
			new DefinePlugin({
				MAIN_NAME: JSON.stringify('App'),
				VERSION: JSON.stringify('1.0.0'),
				LOGGER: JSON.stringify(cfg.env.logger),
				RANDOM_URL: JSON.stringify(cfg.mode === 'development' ? '/random' : 'https://some-random-api.ml'),
			}),
			new PugPlugin({
				verbose: !isProd,
				css: {
					filename: 'assets/css/[name].[contenthash:8].css',
				},
			}),
		],
		optimization: {
			minimize: cfg.mode === 'production',
			minimizer: [
				new TerserPlugin({
					include: /\.min\.js$/,
					parallel: true,
					extractComments: 'all',
				}),
			],
		},
		devServer: {
			port: 8008,
			open: false,
			allowedHosts: 'all',
			static: {
				directory: path.join(__dirname, 'build'),
			},
			compress: true,
			watchFiles: {
				paths: ['src/**/*.*', 'src/**'],
				options: {
					usePolling: true,
				},
			},
			proxy: {
				'/random/**': {
					target: 'https://some-random-api.ml',
					secure: true,
					changeOrigin: true,
					pathRewrite: {
						'/random': '',
					},
				},
				'/githublab/**': {
					target: 'https://api.github.com',
					secure: true,
					changeOrigin: true,
					pathRewrite: {
						'/githublab': '',
					},
				},
			},
		},
	};
};

export default config;
