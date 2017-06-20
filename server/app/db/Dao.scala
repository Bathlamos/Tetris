package db

import models.ScoreEntry
import scala.collection.mutable.ArrayBuffer

import scala.collection.mutable

class Dao {

  private val map = mutable.HashMap[String, Int]()
  map += ("Nathaniel" -> 1500)
  map += ("Simon" -> 1300)
  map += ("Jeffrey" -> 900)

  def getTopTenEntries : Seq[ScoreEntry] = {
    val res = ArrayBuffer.empty[ScoreEntry]
    for ((k,v) <- map)
      res += ScoreEntry(k, v)
    res
  }

  def addScoreEntry(name:String, score:Int): Boolean = {
    map += (name -> score)
    true
  }

}
