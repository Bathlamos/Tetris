name := """play-scala"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.11"

libraryDependencies += jdbc
libraryDependencies += cache
libraryDependencies += ws
libraryDependencies += "org.sangria-graphql" %% "sangria" % "1.2.1"
libraryDependencies += "org.sangria-graphql" %% "sangria-spray-json" % "1.0.0"
libraryDependencies += "com.typesafe.akka" %% "akka-http" % "10.0.1"
libraryDependencies += "com.typesafe.akka" %% "akka-http-spray-json" % "10.0.1"

libraryDependencies += "com.typesafe.akka" %% "akka-http-experimental" % "2.4.11.2"
libraryDependencies += "com.typesafe.akka" %% "akka-stream" % "2.4.11.2"
libraryDependencies += "com.typesafe.akka" %% "akka-http-core" % "2.4.11.2"

