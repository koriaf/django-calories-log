(function (){
  module.exports = {}
  module.exports.Table = React.createClass({
      render: function() {
          return <div className="table-responsive">
              <table className="table  table-striped table-condensed">
                {this.props.children}
              </table>
              </div>
      }
  });
   
  module.exports.TableHeader = React.createClass({
      render: function() {
          return <thead>
                    {this.props.children}
                 </thead>
      }
  });

  module.exports.TableBody = React.createClass({
      render: function() {
          return <tbody>
                  {this.props.children}
                 </tbody>
      }
  });

  module.exports.TableRow = React.createClass({
      render: function() {
          return <tr>
                  {this.props.children}
                 </tr>
      }
  });

  module.exports.TableCell = React.createClass({
      render: function() {
          if (this.props.header) {
            return (<th>{this.props.value}
                    </th>);
          }
          
          return (<td {...this.props} >{this.props.value}
                  {this.props.children} 
                  </td>);
      }
  });
})();