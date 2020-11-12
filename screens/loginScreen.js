import React from 'react';
import {Text,TouchableOpacity,View,StyleSheet,Image, TouchableHighlightBase,FlatList,TextInput,KeyboardAvoidingView, AsyncStorage}from 'react-native';
import * as firebase from 'firebase'

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailId:'',
            password:''
        }
    }

    login=async(email,password)=>{
        if(email&&password){
            try{
                const respose=await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                 case 'auth/user-not-found':
                     alert("user doesnt exist")
                     break
                     case 'auth/invalid-email':
                         alert("invalid email or password")
                         break
                }
            }
        }
        else{
            alert('enter email password')
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}>
                <View>
                <Image
          source={require("../assets/booklogo.jpg")}
          style={{width:200,height:200}}/>
          <Text style={{textAlign:'center',fontSize:30}}>wily</Text>

                </View>
                <View>
                <TextInput
                       style={styles.loginBox}
                       placeholder="abc@example.com"
                       keyboardType='email-address'
                       onChangeText={(text)=>{
                           this.setState({emailId:text})
                       }}
                       />
                       <TextInput
                       style={styles.loginBox}
                       placeholder="enter password"
                       secureTextEntry={true}
                       onChangeText={(text)=>{
                           this.setState({password:text})
                       }}
                       />
                </View>
                <View>
                    <TouchableOpacity style={{height:30, width:90,
                borderWidth:1,
            marginTop:20,
        paddingTop:5,borderRadius:7}}
                        onPress={()=>{this.login(this.state.emailId,this.state.password)}}>
                            <Text Style={{textAlign:'center'}}>login</Text>
                        </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}
const styles=StyleSheet.create({
    loginBox:{
        width:300,
        height:40,
        borderWidth:1.5,
        fontSize:20,
        margin:10,
        paddingLeft:10,
    }
})
