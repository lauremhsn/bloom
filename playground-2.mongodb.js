const database = 'BLOOM_DATABASE';
const collectionUsers = 'USERS';
const collectionFeeds = 'FEEDS';

use(database);

db.createCollection(collectionFeeds, {
  validator: {
    $jsonSchema: {
      "bsonType": "object",
      required: ["username", "feed"],
      properties: {
        username: {
          "bsonType": "string",
        },
        feed: {
          "bsonType": "object",
          required: ["feedType", "posts"],
          properties: {
            feedType: {
              "bsonType": "string",
              enum: ["general", "professionalGardener", "NGO", "business"],
            },
            posts: {
              "bsonType": "array",
              items: {
                "bsonType": "object",
                required: ["text"],
                properties: {
                  text: {
                    "bsonType": "string",
                  },
                  picture: {
                    "bsonType": "string",
                  },
                  link: {
                    "bsonType": "string",
                    pattern: "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
                  },
                  likes: {
                    "bsonType": "int",
                    minimum: 0,
                  },
                  comments: {
                    "bsonType": "array",
                    items: {
                      "bsonType": "object",
                      properties: {
                        userID: {
                          "bsonType": "string",
                        },
                        comment: {
                          "bsonType": "string",
                        }
                      }
                    }
                  }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  }
});

db.createCollection(collectionUsers,
  {
    validator: {
      $jsonSchema: {
        "bsonType": "object",
        required: ["accountType", "username", "age", "email"],
        properties: {
          accountType: {
            "bsonType": "string",
            enum: ["general", "professionalGardener", "NGO", "business"]
          },
          username: {
            "bsonType": "string",
          },
          age: {
            "bsonType": "int",
            minimum: 0
          },
          email: {
            "bsonType": "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
          picture: {
            "bsonType": "string",
          },
          professionalGardener: {
            "bsonType": "object",
            required: ["yearsOfExperience", "availableCourses"],
            properties: {
              yearsOfExperience: {
                "bsonType": "int",
                minimum: 0
              },
              availableCourses: {
                "bsonType": "array",
                items: {
                  "bsonType": "object",
                  required: ["title", "description", "link", "rating"],
                  properties: {
                    title: {
                      "bsonType": "string",
                    },
                    description: {
                      "bsonType": "string",
                    },
                    rating: {
                      "bsonType": "int",
                      minimum: 0,
                    },
                    link: {
                      "bsonType": "string",
                      pattern: "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
                    }
                  }
                }
              }
            }
          },
          NGO: {
            "bsonType": "object",
            required: ["ongoingProjects"],
            properties: {
              ongoingProjects: {
                "bsonType": "array",
                items: {
                  "bsonType": "object",
                  required: ["title", "description", "link"],
                  properties: {
                    title: {
                      "bsonType": "string",
                    },
                    description: {
                      "bsonType": "string",
                    },
                    link: {
                      "bsonType": "string",
                      pattern: "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
                    }
                  }
                }
              }
            }
          },
          business: {
            "bsonType": "object",
            required: ["productCatalogue"],
            properties: {
              productCatalogue: {
                "bsonType": "array",
                items: {
                  "bsonType": "object",
                  required: ["name", "price", "rating"],
                  properties: {
                    name: {
                      "bsonType": "string",
                    },
                    price: {
                      "bsonType": "int",
                      minimum: 1,
                    },
                    rating: {
                      "bsonType": "int",
                    }
                  }
                }
              }

            }
          }
        },
        additionalProperties: false
      }
    }
  }
)
