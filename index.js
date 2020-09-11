const { Keystone } = require('@keystonejs/keystone');
const { Text, Checkbox,CalendarDay, Password } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'Hello-Keystone';
const adapterConfig = { mongoUri: 'mongodb://localhost/hello-keystone' };


const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: async keystone => {
    await createItems({
      keystone,
      listKey: 'User',
      items: [
        { data: { name: 'John Duck', email: 'john@duck.com', password: 'dolphins' } },
        { data: { name: 'Barry', email: 'bartduisters@bartduisters.com', password: 'dolphins' } },
      ],
    });
  }
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
    isComplete:{ type:Checkbox,defaultValue:false},
    deadline:{type:CalendarDay,dateFrom:'2000-01-01',dateTo:'2050-12-31',isRequired:false,defaultValue: new Date().toISOString('YYYY-MM-DD').substring(0,10)},
    assignedBy:{type:Text,isRequired:true},
  },
});

keystone.createList('User',{
  fields:{
    name:{
      type:Text,
    },
    email:{
      type:Text,
      isUnique:true
    },
    isAdmin:{
      type:Checkbox,
    },
    password:{
      type:Password,
    },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type:PasswordAuthStrategy,
  list:'User',
});



module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({ name: PROJECT_NAME, enableDefaultRoute: true,authStrategy }),
  ],
};
