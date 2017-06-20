package models

import db.Dao
import sangria.schema._
import sangria.macros.derive._


object SchemaDefinition {

  private val ScoreEntryType = deriveObjectType[Unit, ScoreEntry](
    ObjectTypeDescription("The name and score of someone's game"),
    DocumentField("name", "Username of the player"))

  val QueryType = ObjectType("Query", fields[Dao, Unit](

    Field("scores", ListType(ScoreEntryType),
      description = Some("Returns a list of the top ten scores."),
      resolve = _.ctx.getTopTenEntries)))


  val NameArg = Argument("name", StringType,
    description = "The name of the player.")

  val ScoreArg = Argument("score", IntType,
    description = "The score of the player, for the current game.")

  val MutationType = ObjectType("Mutation", fields[Dao, Unit](

    Field("addScore", BooleanType,
      description = Some("Persists a new highscores entry."),
      arguments = NameArg :: ScoreArg :: Nil,
      resolve = ctx => ctx.ctx.addScoreEntry(ctx.arg(NameArg), ctx.arg(ScoreArg)))))

  val schema = Schema(QueryType, Some(MutationType))

}
