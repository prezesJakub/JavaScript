use("AGH");

db.createCollection("students");

db.students.insertMany([
  { firstName: "Anna", lastName: "Nowak", faculty: "WI" },
  { firstName: "Krzysztof", lastName: "Kowalski", faculty: "WIET" },
  { firstName: "Maria", lastName: "Zięba", faculty: "WMS" },
  { firstName: "Jan", lastName: "Nowicki", faculty: "WIET" },
]);

db.students.find({ faculty: "WIET" });
db.students.find().pretty();