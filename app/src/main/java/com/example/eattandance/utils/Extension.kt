package com.example.eattandance.utils

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.appcompat.widget.AppCompatEditText
import androidx.core.content.ContextCompat
import com.example.eattandance.R
import com.example.eattandance.databinding.SnackbarCustomGenericBinding
import com.google.android.material.snackbar.Snackbar
import java.util.regex.Matcher
import java.util.regex.Pattern


fun AppCompatEditText.isBlank(): Boolean {
    return this.text.isNullOrEmpty()
}

fun AppCompatEditText.getEditTextString(): String {
    return this.text.toString().trim()
}

fun EditText.isBlank(): Boolean {
    return this.text.isNullOrEmpty()
}

val String.isEmailValid: Boolean
    get() {
        val pattern: Pattern
        val emailPattern =
            "^[_A-Za-z\\d-+]+(\\.[_A-Za-z\\d-]+)*@" + "[A-Za-z\\d-]+(\\.[A-Za-z\\d]+)*(\\.[A-Za-z]{2,})$"
        pattern = Pattern.compile(emailPattern)
        val matcher: Matcher = pattern.matcher(this)
        return matcher.matches()
    }

val String.isUserNameValid: Boolean
    get() {
        val pattern: Pattern
        val userPattern = "^[\\p{L} .'-]+$"
        pattern = Pattern.compile(userPattern)
        val matcher: Matcher = pattern.matcher(this)
        return matcher.matches()
    }

fun showError(message: String, container: View, activity: Activity) {

    val binding = SnackbarCustomGenericBinding.inflate(activity.layoutInflater)
    val snackBar = Snackbar.make(container, "", Snackbar.LENGTH_LONG)
    val snackBarView: View = snackBar.view
    snackBar.view.background = ContextCompat.getDrawable(activity, R.drawable.bg_round_10dp)
    snackBar.apply {
        (view as ViewGroup).addView(binding.root)
        binding.tvMessage.text = message
        show()

    }

}