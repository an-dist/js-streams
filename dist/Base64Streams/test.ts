import { Base64Decoder, Base64Encoder } from "./Base64Streams.ts"
import { Utf8DecoderStream, Utf8EncoderStream } from "../Utf8Streams/Utf8Streams.ts"

const source = (data: string[]) => new ReadableStream({
  start(controller) {
    for (const d of data) {
      controller.enqueue(d)
    }
    controller.close()
  }
})

const logging = (prefix: string) => new TransformStream({
  transform(chunk, controller) {
    console.log(prefix, JSON.stringify(chunk))
    controller.enqueue(chunk)
  }
})

const result = {
  encoded: "",
  decoded: "",
}

const peek = (result: { encoded: string }) => new TransformStream({
  transform(chunk, controller) {
    result.encoded += chunk
    controller.enqueue(chunk)
  }
})

const terminate = (result: { decoded: string }) => new WritableStream({
  write(chunk) {
    result.decoded += chunk
  }
})

const data = [
  `Unicode, formally The Unicode Standard,[note 1] is a text encoding standard maintained by the Unicode Consortium designed to support the use of text written in all of the world's major writing systems. Version 15.1 of the standard[A] defines 149813 characters[3] and 161 scripts used in various ordinary, literary, academic, and technical contexts.
  Many common characters, including numerals, punctuation, and other symbols, are unified within the standard and are not treated as specific to any given writing system. Unicode encodes thousands of emoji, with the continued development thereof conducted by the Consortium as a part of the standard.[4] Moreover, the widespread adoption of Unicode was in large part responsible for the initial popularization of emoji outside of Japan. Unicode is ultimately capable of encoding more than 1.1 million characters.
  Unicode has largely supplanted the previous environment of myriad incompatible character sets, each used within different locales and on different computer architectures. Unicode is used to encode the vast majority of text on the Internet, including most web pages, and relevant Unicode support has become a common consideration in contemporary software development.
  The Unicode character repertoire is synchronized with ISO/IEC 10646, each being code-for-code identical with one another. However, The Unicode Standard is more than just a repertoire within which characters are assigned. To aid developers and designers, the standard also provides charts and reference data, as well as annexes explaining concepts germane to various scripts, providing guidance for their implementation. Topics covered by these annexes include character normalization, character composition and decomposition, collation, and directionality.[5]
  Unicode text is processed and stored as binary data using one of several encodings, which define how to translate the standard's abstracted codes for characters into sequences of bytes. The Unicode Standard itself defines three encodings: UTF-8, UTF-16, and UTF-32, though several others exist. Of these, UTF-8 is the most widely used by a large margin, in part due to its backwards-compatibility with ASCII.
  Origin and development
  Unicode was originally designed with the intent of transcending limitations present in all text encodings designed up to that point: each encoding was relied upon for use in its own context, but with no particular expectation of compatibility with any other. Indeed, any two encodings chosen were often totally unworkable when used together, with text encoded in one interpreted as garbage characters by the other. Most encodings had only been designed to facilitate interoperation between a handful of scripts—often primarily between a given script and Latin characters—not between a large number of scripts, and not with all of the scripts supported being treated in a consistent manner.
  The philosophy that underpins Unicode seeks to encode the underlying characters—graphemes and grapheme-like units—rather than graphical distinctions considered mere variant glyphs thereof, that are instead best handled by the typeface, through the use of markup, or by some other means. In particularly complex cases, such as the treatment of orthographical variants in Han characters, there is considerable disagreement regarding which differences justify their own encodings, and which are only graphical variants of other characters.
  At the most abstract level, Unicode assigns a unique number called a code point to each character. Many issues of visual representation—including size, shape, and style—are intended to be up to the discretion of the software actually rendering the text, such as a web browser or word processor. However, partially with the intent of encouraging rapid adoption, the simplicity of this original model has become somewhat more elaborate over time, and various pragmatic concessions have been made over the course of the standard's development.
  The first 256 code points mirror the ISO/IEC 8859-1 standard, with the intent of trivializing the conversion of text already written in Western European scripts. To preserve the distinctions made by different legacy encodings, therefore allowing for conversion between them and Unicode without any loss of information, many characters nearly identical to others, in both appearance and intended function, were given distinct code points. For example, the Halfwidth and Fullwidth Forms block encompasses a full semantic duplicate of the Latin alphabet, because legacy CJK encodings contained both "fullwidth" (matching the width of CJK characters) and "halfwidth" (matching ordinary Latin script) characters.
  The Unicode Bulldog Award is given to people deemed to be influential in Unicode's development, with recipients including Tatsuo Kobayashi, Thomas Milo, Roozbeh Pournader, Ken Lunde, and Michael Everson.[6]
  History
  The origins of Unicode can be traced back to the 1980s, to a group of individuals with connections to Xerox's Character Code Standard (XCCS).[7] In 1987, Xerox employee Joe Becker, along with Apple employees Lee Collins and Mark Davis, started investigating the practicalities of creating a universal character set.[8] With additional input from Peter Fenwick and Dave Opstad,[7] Becker published a draft proposal for an "international/multilingual text character encoding system in August 1988, tentatively called Unicode". He explained that "the name 'Unicode' is intended to suggest a unique, unified, universal encoding".[7]
  In this document, entitled Unicode 88, Becker outlined a scheme using 16-bit characters:[7]
  Unicode is intended to address the need for a workable, reliable world text encoding. Unicode could be roughly described as "wide-body ASCII" that has been stretched to 16 bits to encompass the characters of all the world's living languages. In a properly engineered design, 16 bits per character are more than sufficient for this purpose.
  This design decision was made based on the assumption that only scripts and characters in 'modern' use would require encoding:[7]
  Unicode gives higher priority to ensuring utility for the future than to preserving past antiquities. Unicode aims in the first instance at the characters published in the modern text (e.g. in the union of all newspapers and magazines printed in the world in 1988), whose number is undoubtedly far below 214 = 16,384. Beyond those modern-use characters, all others may be defined to be obsolete or rare; these are better candidates for private-use registration than for congesting the public list of generally useful Unicode.
  In early 1989, the Unicode working group expanded to include Ken Whistler and Mike Kernaghan of Metaphor, Karen Smith-Yoshimura and Joan Aliprand of Research Libraries Group, and Glenn Wright of Sun Microsystems. In 1990, Michel Suignard and Asmus Freytag of Microsoft and NeXT's Rick McGowan had also joined the group. By the end of 1990, most of the work of remapping existing standards had been completed, and a final review draft of Unicode was ready.
  The Unicode Consortium was incorporated in California on 3 January 1991,[9] and the first volume of The Unicode Standard was published that October. The second volume, now adding Han ideographs, was published in June 1992.
  In 1996, a surrogate character mechanism was implemented in Unicode 2.0, so that Unicode was no longer restricted to 16 bits. This increased the Unicode codespace to over a million code points, which allowed for the encoding of many historic scripts, such as Egyptian hieroglyphs, and thousands of rarely used or obsolete characters that had not been anticipated for inclusion in the standard. Among these characters are various rarely used CJK characters—many mainly being used in proper names, making them far more necessary for a universal encoding than the original Unicode architecture envisioned.[10]
  Version 1.0 of Microsoft's TrueType specification, published in 1992, used the name 'Apple Unicode' instead of 'Unicode' for the Platform ID in the naming table.
  Unicode Consortium
  Main article: Unicode Consortium
  The Unicode Consortium is a nonprofit organization that coordinates Unicode's development. Full members include most of the main computer software and hardware companies (and few others) with any interest in text-processing standards, including Adobe, Apple, Google, IBM, Meta (previously as Facebook), Microsoft, Netflix, and SAP.[11]
  Over the years several countries or government agencies have been members of the Unicode Consortium. Presently only the Ministry of Endowments and Religious Affairs (Oman) is a full member with voting rights.[11]
  The Consortium has the ambitious goal of eventually replacing existing character encoding schemes with Unicode and its standard Unicode Transformation Format (UTF) schemes, as many of the existing schemes are limited in size and scope and are incompatible with multilingual environments.
  Scripts covered
  Main article: Script (Unicode)
  Many modern applications can render a substantial subset of the many scripts in Unicode, as demonstrated by this screenshot from the OpenOffice.org application.
  Unicode currently covers most major writing systems in use today.[12][better source needed]
  As of 2024, a total of 161 scripts[13] are included in the latest version of Unicode (covering alphabets, abugidas and syllabaries), although there are still scripts that are not yet encoded, particularly those mainly used in historical, liturgical, and academic contexts. Further additions of characters to the already encoded scripts, as well as symbols, in particular for mathematics and music (in the form of notes and rhythmic symbols), also occur.
  The Unicode Roadmap Committee (Michael Everson, Rick McGowan, Ken Whistler, V.S. Umamaheswaran)[14] maintain the list of scripts that are candidates or potential candidates for encoding and their tentative code block assignments on the Unicode Roadmap[15] page of the Unicode Consortium website. For some scripts on the Roadmap, such as Jurchen and Khitan large script, encoding proposals have been made and they are working their way through the approval process. For other scripts, such as Mayan (besides numbers) and Rongorongo, no proposal has yet been made, and they await agreement on character repertoire and other details from the user communities involved.
  Some modern invented scripts which have not yet been included in Unicode (e.g., Tengwar) or which do not qualify for inclusion in Unicode due to lack of real-world use (e.g., Klingon) are listed in the ConScript Unicode Registry, along with unofficial but widely used Private Use Areas code assignments.
  There is also a Medieval Unicode Font Initiative focused on special Latin medieval characters. Part of these proposals has been already included in Unicode.
  Script Encoding Initiative
  The Script Encoding Initiative,[16] a project run by Deborah Anderson at the University of California, Berkeley was founded in 2002 with the goal of funding proposals for scripts not yet encoded in the standard. The project has become a major source of proposed additions to the standard in recent years.[17]
  Versions
  The Unicode Consortium together with the ISO have developed a shared repertoire following the initial publication of The Unicode Standard: Unicode and the ISO's Universal Coded Character Set (UCS) use identical character names and code points. However, the Unicode versions do differ from their ISO equivalents in two significant ways.
  While the UCS is a simple character map, Unicode specifies the rules, algorithms, and properties necessary to achieve interoperability between different platforms and languages. Thus, The Unicode Standard includes more information, covering in-depth topics such as bitwise encoding, collation, and rendering. It also provides a comprehensive catalog of character properties, including those needed for supporting bidirectional text, as well as visual charts and reference data sets to aid implementers. Previously, The Unicode Standard was sold as a print volume containing the complete core specification, standard annexes,[note 2] and code charts. However, version 5.0, published in 2006, was the last version printed this way. Starting with version 5.2, only the core specification, published as a print-on-demand paperback, may be purchased.[18] The full text, on the other hand, is published as a free PDF on the Unicode website.
  A practical reason for this publication method highlights the second significant difference between the UCS and Unicode—the frequency with which updated versions are released and new characters added. The Unicode Standard has regularly released annual expanded versions, occasionally with more than one version released in a calendar year and with rare cases where the scheduled release had to be postponed. For instance, in April 2020, a month after version 13.0 was published, the Unicode Consortium announced they had changed the intended release date for version 14.0, pushing it back six months to September 2021 due to the COVID-19 pandemic.
  Unicode 15.1, the latest version, was released on 12 September 2023. It is a minor version update to version 15.0—released on 13 September 2022—which added a total of 4,489 new characters, including two new scripts, an extension to the CJK Unified Ideographs block, and multiple additions to existing blocks. 33 new emoji were added, such as the "wireless" (network) symbol and additional colored hearts.[19][20]
  Thus far, the following versions of The Unicode Standard have been published. Update versions, which do not include any changes to character repertoire, are signified by the third number (e.g., "version 4.0.1") and are omitted in the table below.[21]`,
]

console.groupCollapsed("Testing")

await source(data)
  .pipeThrough(logging("Source :"))
  .pipeThrough(new Utf8EncoderStream())
  .pipeThrough(new Base64Encoder().transformable())
  .pipeThrough(logging("Encoded:"))
  .pipeThrough(peek(result))
  .pipeThrough(new Base64Decoder().transformable())
  .pipeThrough(new Utf8DecoderStream())
  .pipeThrough(logging("Decoded:"))
  .pipeTo(terminate(result))

console.log("Base64:", result.encoded, "(", result.encoded.length, ")")
console.log("Result:", result.decoded, "(", result.decoded.length, ")")
console.groupEnd()
console.assert(
  result.decoded === data.join(""),
  "data=[", JSON.stringify(data.join("")), "](", data.join("").length, ")",
  "result=[", JSON.stringify(result.decoded), "](", result.decoded.length, "),",
)

console.log("Test completed.")