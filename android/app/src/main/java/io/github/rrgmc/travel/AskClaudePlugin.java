package io.github.rrgmc.travel;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Hands a question about a trip item to the Claude app through Android's share system (ACTION_SEND),
 * so it opens a new chat with the text ready. Claude has no link that pre-fills a regular chat, so
 * sharing is the way in. Falls back to the system share sheet when the Claude app isn't installed.
 */
@CapacitorPlugin(name = "AskClaude")
public class AskClaudePlugin extends Plugin {

    static final String CLAUDE_PACKAGE = "com.anthropic.claude";

    @PluginMethod
    public void share(PluginCall call) {
        String text = call.getString("text", "");
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_TEXT, text);

        JSObject result = new JSObject();
        try {
            Intent direct = new Intent(send);
            direct.setPackage(CLAUDE_PACKAGE);
            getActivity().startActivity(direct);
            result.put("target", "claude");
        } catch (ActivityNotFoundException notInstalled) {
            getActivity().startActivity(Intent.createChooser(send, call.getString("title", "")));
            result.put("target", "chooser");
        }
        call.resolve(result);
    }
}
