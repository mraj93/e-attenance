package com.example.eattandance.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.eattandance.databinding.ActivityLoginBinding
import com.example.eattandance.utils.getEditTextString
import com.example.eattandance.utils.isBlank
import com.example.eattandance.utils.isEmailValid
import com.example.eattandance.utils.showError

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.tvSignUp.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }

        binding.btnBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.bLogin.setOnClickListener {
            validation()
        }
    }

    private fun validation() {
        binding.run {
            when {
                etEmail.isBlank() -> showError(
                    "Please enter email",
                    binding.root,
                    this@LoginActivity
                )
                !etEmail.getEditTextString().isEmailValid -> showError(
                    "Please enter valid email",
                    binding.root,
                    this@LoginActivity
                )
                etPass.isBlank() -> showError(
                    "Please enter password",
                    binding.root,
                    this@LoginActivity
                )
//                !etPass.getEditTextString().isPasswordValid -> showError(
//                    resourcesForLanguage.getString(
//                        R.string.password_must_contain_new
//                    )
//                )
                else -> {
//                    throw RuntimeException("Test Crash")
//                    login()
                }
            }
        }
    }
}

