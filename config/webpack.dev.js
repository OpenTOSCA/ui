const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const common = require('./webpack.common.js');
const helpers = require('./helpers');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

module.exports = webpackMerge(common, {

    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: 'cheap-module-eval-source-map',

    /*
     * https://webpack.github.io/docs/list-of-plugins.html
     */
    plugins: [

        /*
         * https://webpack.js.org/plugins/loader-options-plugin
         */
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),

        new ExtractTextPlugin('[name].css'),

        /*
         * https://webpack.github.io/docs/list-of-plugins.html#defineplugin
         */
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV),
                'NODE_ENV': JSON.stringify(ENV),
            }
        }),
    ],

    /*
     * https://webpack.js.org/configuration/dev-server
     */
    devServer: {
        port: 3000,
        historyApiFallback: {
            index: '/OpenTOSCAUi/'
        },
        watchOptions: {aggregateTimeout: 300, poll: 1000},
        contentBase: helpers.root('dist'),
        publicPath: '/OpenTOSCAUi/'
    },

});
