module.exports = {
  chainWebpack: config => {
    // remove the prefetch plugin
    config.plugins.delete("prefetch")

    const svgRule = config.module.rule("svg")
    svgRule.uses.clear()
    svgRule
      .use("svg-inline-loader")
      .loader("svg-inline-loader?classPrefix&idPrefix")
  },
}
