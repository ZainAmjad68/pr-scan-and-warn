module.exports = {
    'destroy()' : 'Be Careful About Using Destroy. It can have unintentional consequences.',
    'dropTable' : 'Using DropTable is not recommended. It can cause irrevocable data loss.',
    'Promise.all' : `Be Careful!\n1. This may cause performance issues due to concurrent execution.\n2. If one promise fails, it can potentially block the resolution of other promises.`,
    'Promise.map' : `Be Careful!\n1. This may cause performance issues due to concurrent execution.\n2. If one promise fails, it can potentially block the resolution of other promises.`
};