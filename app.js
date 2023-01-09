const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-subhu:iisubhu45@atlascluster.gwuzk3g.mongodb.net/todolist", {
  useNewUrlParser: true,
});

//creating Schema
const itemsSchema = {
  name : {
    type : String,
    required : true
  }
};

//Creating a model
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item ({
  name : "Welcome to your todolist."
});

const item2 = new Item ({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : {
    type : String,
    required : true
  },
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

  //mongoose find fn
  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){

          if(err) console.log(err);
          else
            console.log("Inserted Succesfully to our DB.");


      });
      res.redirect("/");

    } else{
          res.render('index', {TodayDay: "Today", ItemAdded: foundItems});
        }

  });

});

//home route
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.List;
  console.log(listName);
  const item = new Item({

      name : itemName

  });

  if(listName === "Today"){
  item.save();
  res.redirect("/");
}else {
  List.findOne({name : listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

//delete route
app.post("/delete", function(req, res){

  const checked = req.body.checkbox;
  const ListName = req.body.listName;
  console.log(ListName);

  if(ListName === "Today"){

  Item.findByIdAndRemove(checked, function(err){
    if(!err)
      console.log("Succesfully.");
    else
      console.log(err);
    res.redirect("/");
  });

}else {

  List.findOneAndUpdate({name : ListName}, {$pull : {items : {_id: checked}}}, function(err, foundList){
    if(!err)
      res.redirect("/" + ListName);
  });


}

});


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new List
        const list = new List({

          name : customListName,
          items : defaultItems


        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //show List


      res.render('index', {TodayDay: foundList.name, ItemAdded: foundList.items});
      }
    }
  })




})


app.listen("3000", function(){
  console.log("Server got started bro.");
});
