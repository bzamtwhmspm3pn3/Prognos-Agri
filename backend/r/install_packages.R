packages < - c("plumber", "jsonlite", "glmnet", "randomForest") 
for (pkg in packages) { 
  if (!require(pkg, character.only = TRUE)) { 
    install.packages(pkg, dependencies = TRUE) 
  } 
} 
